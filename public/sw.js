/**
 * Service Worker
 * 
 * Provides offline capability, caching, and push notifications.
 */

const CACHE_NAME = 'reawakened-v2';
const API_CACHE_NAME = 'reawakened-api-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

const API_CACHE_CONFIG = {
  '/api/sparks/published': { maxAge: 5 * 60 * 1000 },
  '/api/sparks/today': { maxAge: 60 * 60 * 1000 },
  '/api/sparks/featured': { maxAge: 5 * 60 * 1000 },
  '/api/sparks/dashboard': { maxAge: 5 * 60 * 1000 },
  '/api/journeys': { maxAge: 30 * 60 * 1000 },
  '/api/reflection-cards/today': { maxAge: 60 * 60 * 1000 },
};

// ============================================================================
// Install Event
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Service worker installed');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('[SW] Failed to cache static assets:', error);
    })
  );
});

// ============================================================================
// Activate Event
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  const validCaches = [CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// ============================================================================
// Fetch Event - Network First with API Caching
// ============================================================================

function isCacheableApi(pathname) {
  return Object.keys(API_CACHE_CONFIG).some(pattern => pathname.startsWith(pattern));
}

function getCacheConfig(pathname) {
  for (const pattern of Object.keys(API_CACHE_CONFIG)) {
    if (pathname.startsWith(pattern)) {
      return API_CACHE_CONFIG[pattern];
    }
  }
  return null;
}

async function handleApiRequest(request, url) {
  const config = getCacheConfig(url.pathname);
  if (!config) {
    return fetch(request);
  }

  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get('sw-cached-at');
    const age = cachedTime ? Date.now() - parseInt(cachedTime) : Infinity;
    
    if (age < config.maxAge) {
      fetch(request).then(response => {
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set('sw-cached-at', Date.now().toString());
          const cachedCopy = new Response(response.clone().body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
          cache.put(request, cachedCopy);
        }
      }).catch(() => {});
      
      return cachedResponse;
    }
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', Date.now().toString());
      const cachedCopy = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
      cache.put(request, cachedCopy);
    }
    return response;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    if (isCacheableApi(url.pathname)) {
      event.respondWith(handleApiRequest(request, url));
    }
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseToCache = response.clone();

        if (response.ok && (
          request.destination === 'script' ||
          request.destination === 'style' ||
          request.destination === 'image' ||
          request.destination === 'font'
        )) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          if (request.mode === 'navigate') {
            return caches.match('/');
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// ============================================================================
// Push Notifications
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Reawakened',
    body: 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    data: {},
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (error) {
    console.error('[SW] Failed to parse push data:', error);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    data: data.data,
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ============================================================================
// Notification Click
// ============================================================================

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (event.notification.data?.url) {
              client.navigate(urlToOpen);
            }
            return;
          }
        }

        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================================================
// Background Sync
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_REQUESTED' });
        });
      })
    );
  }
});

// ============================================================================
// Message Handling
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker loaded');
