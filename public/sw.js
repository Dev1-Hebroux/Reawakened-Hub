/**
 * Premium PWA Service Worker
 * 
 * Features:
 * - Intelligent caching strategies (Cache-First, Network-First, Stale-While-Revalidate)
 * - Offline support with fallback pages
 * - Background sync for offline actions
 * - Push notifications with rich content
 * - Smart cache management with versioning
 */

const APP_NAME = 'Reawakened';
const CACHE_VERSION = 'v2.0.0';

const CACHES = {
  static: `${APP_NAME}-static-${CACHE_VERSION}`,
  dynamic: `${APP_NAME}-dynamic-${CACHE_VERSION}`,
  images: `${APP_NAME}-images-${CACHE_VERSION}`,
  audio: `${APP_NAME}-audio-${CACHE_VERSION}`,
  api: `${APP_NAME}-api-${CACHE_VERSION}`,
};

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
];

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
// Install Event
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHES.static);
      
      console.log('[SW] Precaching app shell...');
      await cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to precache:', err);
      });
      
      await self.skipWaiting();
      console.log('[SW] Service worker installed');
    })()
  );
});

// ============================================================================
// Activate Event
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    (async () => {
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
      
      await self.clients.claim();
      console.log('[SW] Service worker activated');
    })()
  );
});

// ============================================================================
// Fetch Event
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;
  
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
// Push Notifications
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  let data = { title: 'Reawakened', body: 'You have a new notification' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/badge-72x72.png',
    image: data.image,
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    renotify: data.renotify || false,
    vibrate: [100, 50, 100],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  if (event.action) {
    console.log('[SW] Action clicked:', event.action);
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return clients.openWindow(urlToOpen);
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

// ============================================================================
// Message Handler (for skipWaiting)
// ============================================================================

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================================
// Caching Strategies
// ============================================================================

async function handleApiRequest(request) {
  const url = new URL(request.url);
  const config = getApiCacheConfig(url.pathname);
  
  if (!config) {
    return fetch(request);
  }
  
  const cache = await caches.open(CACHES.api);
  
  if (config.strategy === 'network-first') {
    return networkFirst(request, cache, config.maxAge);
  } else {
    return staleWhileRevalidate(request, cache, config.maxAge);
  }
}

async function networkFirst(request, cache, maxAge) {
  try {
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      cacheWithTimestamp(cache, request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await getCachedIfFresh(cache, request, maxAge);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function staleWhileRevalidate(request, cache, maxAge) {
  const cachedResponse = await getCachedIfFresh(cache, request, maxAge * 2);
  
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cacheWithTimestamp(cache, request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  
  if (cachedResponse) {
    const cacheTime = await getCacheTimestamp(cache, request);
    const isFresh = cacheTime && (Date.now() - cacheTime < maxAge);
    
    if (!isFresh) {
      const networkResponse = await Promise.race([
        fetchPromise,
        new Promise(resolve => setTimeout(() => resolve(null), 2000))
      ]);
      
      return networkResponse || cachedResponse;
    }
    
    return cachedResponse;
  }
  
  const networkResponse = await fetchPromise;
  
  if (networkResponse) {
    return networkResponse;
  }
  
  return new Response(
    JSON.stringify({ error: 'Offline', offline: true }),
    { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

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
    return new Response(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect fill="#e5e7eb" width="100" height="100"/>
        <text fill="#9ca3af" font-size="12" x="50" y="55" text-anchor="middle">Offline</text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

async function handleAudioRequest(request) {
  const cache = await caches.open(CACHES.audio);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
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

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetchWithTimeout(request, 5000);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHES.static);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHES.static);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - ${APP_NAME}</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #FAF8F5; }
          .container { text-align: center; padding: 2rem; }
          h1 { color: #1a2744; margin-bottom: 0.5rem; }
          p { color: #6b7280; }
          button { background: #7C9A8E; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; margin-top: 1rem; }
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
// Utilities
// ============================================================================

function getApiCacheConfig(pathname) {
  for (const pattern of Object.keys(API_CACHE_CONFIG)) {
    if (pathname.startsWith(pattern)) {
      return API_CACHE_CONFIG[pattern];
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
  return /\.(mp3|wav|ogg|m4a)$/i.test(url.pathname) ||
         url.pathname.includes('/api/audio/') ||
         request.destination === 'audio';
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

async function fetchWithTimeout(request, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

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
