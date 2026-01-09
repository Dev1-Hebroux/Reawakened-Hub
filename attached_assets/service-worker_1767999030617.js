/**
 * Premium PWA Service Worker
 * 
 * Features:
 * - Intelligent caching strategies (Cache-First, Network-First, Stale-While-Revalidate)
 * - Offline support with fallback pages
 * - Background sync for offline actions
 * - Push notifications with rich content
 * - Periodic background sync for fresh content
 * - Smart cache management with versioning
 */

// ============================================================================
// Configuration
// ============================================================================

const APP_NAME = 'Reawakened';
const CACHE_VERSION = 'v1.0.0';

// Cache names
const CACHES = {
  static: `${APP_NAME}-static-${CACHE_VERSION}`,
  dynamic: `${APP_NAME}-dynamic-${CACHE_VERSION}`,
  images: `${APP_NAME}-images-${CACHE_VERSION}`,
  audio: `${APP_NAME}-audio-${CACHE_VERSION}`,
  api: `${APP_NAME}-api-${CACHE_VERSION}`,
};

// Static assets to precache (app shell)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  // Add your critical CSS/JS files here
  // These will be populated by your build tool
];

// API caching configuration
const API_CACHE_CONFIG = {
  '/api/init': { strategy: 'network-first', maxAge: 5 * 60 * 1000 },
  '/api/sparks/dashboard': { strategy: 'stale-while-revalidate', maxAge: 5 * 60 * 1000 },
  '/api/sparks/today': { strategy: 'stale-while-revalidate', maxAge: 60 * 60 * 1000 },
  '/api/sparks/featured': { strategy: 'stale-while-revalidate', maxAge: 5 * 60 * 1000 },
  '/api/journeys': { strategy: 'stale-while-revalidate', maxAge: 30 * 60 * 1000 },
  '/api/reflection-cards/today': { strategy: 'stale-while-revalidate', maxAge: 60 * 60 * 1000 },
  '/api/sparks/published': { strategy: 'stale-while-revalidate', maxAge: 10 * 60 * 1000 },
};

// ============================================================================
// Install Event - Precache Static Assets
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHES.static);
      
      // Precache static assets
      console.log('[SW] Precaching app shell...');
      await cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to precache:', err);
      });
      
      // Skip waiting to activate immediately
      await self.skipWaiting();
      
      console.log('[SW] Service worker installed');
    })()
  );
});

// ============================================================================
// Activate Event - Clean Up Old Caches
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const validCaches = Object.values(CACHES);
      
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith(APP_NAME) && !validCaches.includes(name))
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
      
      // Take control of all clients immediately
      await self.clients.claim();
      
      console.log('[SW] Service worker activated');
    })()
  );
});

// ============================================================================
// Fetch Event - Smart Caching Strategies
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Route to appropriate strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAudioRequest(request)) {
    event.respondWith(handleAudioRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// ============================================================================
// Caching Strategies
// ============================================================================

/**
 * API Requests - Stale-While-Revalidate with TTL
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const config = getApiCacheConfig(url.pathname);
  
  if (!config) {
    // No caching for unconfigured endpoints
    return fetch(request);
  }
  
  const cache = await caches.open(CACHES.api);
  
  if (config.strategy === 'network-first') {
    return networkFirst(request, cache, config.maxAge);
  } else {
    return staleWhileRevalidate(request, cache, config.maxAge);
  }
}

/**
 * Network First - Try network, fall back to cache
 */
async function networkFirst(request, cache, maxAge) {
  try {
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      // Clone and cache with timestamp
      const responseToCache = networkResponse.clone();
      cacheWithTimestamp(cache, request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await getCachedIfFresh(cache, request, maxAge);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Stale-While-Revalidate - Return cache immediately, update in background
 */
async function staleWhileRevalidate(request, cache, maxAge) {
  const cachedResponse = await getCachedIfFresh(cache, request, maxAge * 2); // Allow stale
  
  // Fetch in background
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cacheWithTimestamp(cache, request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  
  if (cachedResponse) {
    // Check if cache is fresh
    const cacheTime = await getCacheTimestamp(cache, request);
    const isFresh = cacheTime && (Date.now() - cacheTime < maxAge);
    
    if (!isFresh) {
      // Cache is stale, wait for network with timeout
      const networkResponse = await Promise.race([
        fetchPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 2000))
      ]);
      
      return networkResponse || cachedResponse;
    }
    
    // Cache is fresh, return immediately
    return cachedResponse;
  }
  
  // No cache, wait for network
  const networkResponse = await fetchPromise;
  
  if (networkResponse) {
    return networkResponse;
  }
  
  // Offline fallback
  return new Response(
    JSON.stringify({ error: 'Offline', offline: true }),
    { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Image Requests - Cache First with lazy background update
 */
async function handleImageRequest(request) {
  const cache = await caches.open(CACHES.images);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect fill="#e5e7eb" width="100" height="100"/>
        <text fill="#9ca3af" font-size="12" x="50" y="55" text-anchor="middle">Offline</text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Audio Requests - Cache First (audio files are large, avoid re-downloading)
 */
async function handleAudioRequest(request) {
  const cache = await caches.open(CACHES.audio);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Only cache if response is not too large (< 10MB)
      const contentLength = networkResponse.headers.get('content-length');
      if (!contentLength || parseInt(contentLength) < 10 * 1024 * 1024) {
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    return new Response('Audio unavailable offline', { status: 503 });
  }
}

/**
 * Static Assets - Cache First (versioned by build)
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHES.static);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For JS/CSS, return empty response to avoid errors
    const url = new URL(request.url);
    if (url.pathname.endsWith('.js')) {
      return new Response('', { headers: { 'Content-Type': 'application/javascript' } });
    }
    if (url.pathname.endsWith('.css')) {
      return new Response('', { headers: { 'Content-Type': 'text/css' } });
    }
    throw error;
  }
}

/**
 * Navigation Requests - Network First with offline fallback
 */
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      // Cache successful navigation
      const cache = await caches.open(CACHES.static);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache first
    const cache = await caches.open(CACHES.static);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort: return basic offline page
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - ${APP_NAME}</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
          .container { text-align: center; padding: 2rem; }
          h1 { color: #111827; margin-bottom: 0.5rem; }
          p { color: #6b7280; }
          button { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// ============================================================================
// Cache Utilities
// ============================================================================

async function cacheWithTimestamp(cache, request, response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-time', Date.now().toString());
  
  const timestampedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
  
  await cache.put(request, timestampedResponse);
}

async function getCacheTimestamp(cache, request) {
  const response = await cache.match(request);
  if (!response) return null;
  
  const cacheTime = response.headers.get('sw-cache-time');
  return cacheTime ? parseInt(cacheTime) : null;
}

async function getCachedIfFresh(cache, request, maxAge) {
  const response = await cache.match(request);
  if (!response) return null;
  
  const cacheTime = response.headers.get('sw-cache-time');
  if (!cacheTime) return response;
  
  const age = Date.now() - parseInt(cacheTime);
  if (age > maxAge) return null;
  
  return response;
}

function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    ),
  ]);
}

// ============================================================================
// Request Type Detection
// ============================================================================

function getApiCacheConfig(pathname) {
  for (const [path, config] of Object.entries(API_CACHE_CONFIG)) {
    if (pathname.startsWith(path)) {
      return config;
    }
  }
  return null;
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname) ||
    request.destination === 'image';
}

function isAudioRequest(request) {
  const url = new URL(request.url);
  return /\.(mp3|wav|ogg|m4a|aac)$/i.test(url.pathname) ||
    request.destination === 'audio' ||
    url.pathname.includes('/audio/');
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

// ============================================================================
// Push Notifications
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: APP_NAME,
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'default',
    data: {},
  };
  
  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (error) {
    console.error('[SW] Error parsing push data:', error);
  }
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    silent: data.silent || false,
    renotify: data.renotify || false,
  };
  
  // Add image if provided
  if (data.image) {
    options.image = data.image;
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================================================
// Notification Click Handler
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  const targetUrl = data.url || '/';
  
  // Handle action buttons
  if (event.action) {
    console.log('[SW] Notification action:', event.action);
    // Handle specific actions here
  }
  
  event.waitUntil(
    (async () => {
      // Try to focus existing window
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          await client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: data,
            url: targetUrl,
          });
          return;
        }
      }
      
      // No existing window, open new one
      await self.clients.openWindow(targetUrl);
    })()
  );
});

// ============================================================================
// Background Sync
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-spark-completion') {
    event.waitUntil(syncSparkCompletions());
  } else if (event.tag === 'sync-journal-entries') {
    event.waitUntil(syncJournalEntries());
  } else if (event.tag === 'sync-prayer-requests') {
    event.waitUntil(syncPrayerRequests());
  }
});

async function syncSparkCompletions() {
  const pendingCompletions = await getPendingFromIndexedDB('spark-completions');
  
  for (const completion of pendingCompletions) {
    try {
      const response = await fetch('/api/sparks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completion),
      });
      
      if (response.ok) {
        await removeFromIndexedDB('spark-completions', completion.id);
      }
    } catch (error) {
      console.error('[SW] Failed to sync completion:', error);
    }
  }
}

async function syncJournalEntries() {
  const pendingEntries = await getPendingFromIndexedDB('journal-entries');
  
  for (const entry of pendingEntries) {
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      
      if (response.ok) {
        await removeFromIndexedDB('journal-entries', entry.id);
      }
    } catch (error) {
      console.error('[SW] Failed to sync journal entry:', error);
    }
  }
}

async function syncPrayerRequests() {
  // Similar pattern for prayer requests
}

// ============================================================================
// Periodic Background Sync (for supported browsers)
// ============================================================================

self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'refresh-daily-content') {
    event.waitUntil(refreshDailyContent());
  }
});

async function refreshDailyContent() {
  try {
    // Prefetch today's content
    const cache = await caches.open(CACHES.api);
    
    const endpoints = [
      '/api/sparks/dashboard',
      '/api/sparks/today',
      '/api/reflection-cards/today',
    ];
    
    await Promise.all(
      endpoints.map(async (endpoint) => {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cacheWithTimestamp(cache, new Request(endpoint), response);
        }
      })
    );
    
    console.log('[SW] Daily content refreshed');
  } catch (error) {
    console.error('[SW] Failed to refresh daily content:', error);
  }
}

// ============================================================================
// IndexedDB Helpers (for offline queue)
// ============================================================================

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`${APP_NAME}-offline`, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('spark-completions')) {
        db.createObjectStore('spark-completions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('journal-entries')) {
        db.createObjectStore('journal-entries', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('prayer-requests')) {
        db.createObjectStore('prayer-requests', { keyPath: 'id' });
      }
    };
  });
}

async function getPendingFromIndexedDB(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

async function removeFromIndexedDB(storeName, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ============================================================================
// Message Handler (communication with main app)
// ============================================================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then(names => 
          Promise.all(names.map(name => caches.delete(name)))
        )
      );
      break;
      
    case 'CACHE_URLS':
      if (payload?.urls) {
        event.waitUntil(
          caches.open(CACHES.static).then(cache => 
            cache.addAll(payload.urls)
          )
        );
      }
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        (async () => {
          const cacheNames = await caches.keys();
          const sizes = {};
          
          for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            sizes[name] = keys.length;
          }
          
          event.source.postMessage({
            type: 'CACHE_STATUS',
            payload: { caches: sizes, version: CACHE_VERSION },
          });
        })()
      );
      break;
  }
});

console.log(`[SW] ${APP_NAME} Service Worker loaded (${CACHE_VERSION})`);
