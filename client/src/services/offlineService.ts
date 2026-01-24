/**
 * Offline Service
 * 
 * Provides offline capability with IndexedDB storage,
 * sync queue management, and network status tracking.
 */

import { getApiUrl } from '../lib/api';

// ============================================================================
// Types
// ============================================================================

export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  endpoint: string;
  method: string;
  body?: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncAt: Date | null;
  syncInProgress: boolean;
}

// ============================================================================
// IndexedDB Helpers
// ============================================================================

const DB_NAME = 'reawakened-offline';
const DB_VERSION = 1;
const SYNC_QUEUE_STORE = 'sync-queue';
const CACHE_STORE = 'cache';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Sync queue store
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      // Cache store for offline data
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

// ============================================================================
// Sync Queue Operations
// ============================================================================

async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>): Promise<string> {
  const db = await openDatabase();

  const queueItem: SyncQueueItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retryCount: 0,
    maxRetries: 3,
    ...item,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.add(queueItem);

    request.onsuccess = () => resolve(queueItem.id);
    request.onerror = () => reject(request.error);
  });
}

async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SYNC_QUEUE_STORE, 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const index = store.index('timestamp');
    const request = index.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeFromSyncQueue(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(SYNC_QUEUE_STORE, 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// Cache Operations
// ============================================================================

interface CacheEntry<T> {
  key: string;
  data: T;
  expiresAt: number;
}

async function setCache<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): Promise<void> {
  const db = await openDatabase();

  const entry: CacheEntry<T> = {
    key,
    data,
    expiresAt: Date.now() + ttlMs,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CACHE_STORE, 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);
    const request = store.put(entry);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getCache<T>(key: string): Promise<T | null> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CACHE_STORE, 'readonly');
    const store = transaction.objectStore(CACHE_STORE);
    const request = store.get(key);

    request.onsuccess = () => {
      const entry = request.result as CacheEntry<T> | undefined;

      if (!entry) {
        resolve(null);
        return;
      }

      if (entry.expiresAt < Date.now()) {
        // Entry expired, delete it
        deleteCache(key).catch(console.error);
        resolve(null);
        return;
      }

      resolve(entry.data);
    };
    request.onerror = () => reject(request.error);
  });
}

async function deleteCache(key: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CACHE_STORE, 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function clearExpiredCache(): Promise<number> {
  const db = await openDatabase();
  const now = Date.now();
  let deletedCount = 0;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CACHE_STORE, 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);
    const index = store.index('expiresAt');
    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        deletedCount++;
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// Network Status
// ============================================================================

let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let syncInProgress = false;
let lastSyncAt: Date | null = null;
const statusListeners: Set<(status: OfflineSyncStatus) => void> = new Set();

function notifyStatusChange(): void {
  const status = getStatus();
  statusListeners.forEach(listener => listener(status));
}

function getStatus(): OfflineSyncStatus {
  return {
    isOnline,
    pendingOperations: 0, // Will be updated by sync process
    lastSyncAt,
    syncInProgress,
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    notifyStatusChange();
    processSyncQueue().catch(console.error);
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    notifyStatusChange();
  });
}

// ============================================================================
// Sync Processing
// ============================================================================

async function processSyncQueue(): Promise<void> {
  if (!isOnline || syncInProgress) return;

  syncInProgress = true;
  notifyStatusChange();

  try {
    const queue = await getSyncQueue();

    for (const item of queue) {
      if (!isOnline) break;

      try {
        const response = await fetch(getApiUrl(item.endpoint), {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: item.body ? JSON.stringify(item.body) : undefined,
          credentials: 'include',
        });

        if (response.ok) {
          await removeFromSyncQueue(item.id);
        } else if (response.status >= 400 && response.status < 500) {
          // Client error, don't retry
          await removeFromSyncQueue(item.id);
          console.error(`Sync failed for ${item.id}: ${response.status}`);
        } else {
          // Server error, increment retry count
          item.retryCount++;
          if (item.retryCount >= item.maxRetries) {
            await removeFromSyncQueue(item.id);
            console.error(`Max retries reached for ${item.id}`);
          } else {
            await updateSyncQueueItem(item);
          }
        }
      } catch (error) {
        // Network error, will retry later
        console.error(`Sync error for ${item.id}:`, error);
        item.retryCount++;
        if (item.retryCount >= item.maxRetries) {
          await removeFromSyncQueue(item.id);
        } else {
          await updateSyncQueueItem(item);
        }
      }
    }

    lastSyncAt = new Date();
  } finally {
    syncInProgress = false;
    notifyStatusChange();
  }
}

// ============================================================================
// Public API
// ============================================================================

export const offlineService = {
  // Sync Queue
  queueOperation: addToSyncQueue,
  getSyncQueue,
  processQueue: processSyncQueue,

  // Cache
  setCache,
  getCache,
  deleteCache,
  clearExpiredCache,

  // Status
  getStatus,
  isOnline: () => isOnline,

  subscribe(listener: (status: OfflineSyncStatus) => void): () => void {
    statusListeners.add(listener);
    return () => statusListeners.delete(listener);
  },

  // Manual sync trigger
  async sync(): Promise<void> {
    if (isOnline) {
      await processSyncQueue();
    }
  },
};

export default offlineService;
