// public/service-worker.js
const CACHE_NAME = 'relax-app-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Add paths to your critical assets: CSS, JS, images used on the main page
  // Example: '/styles/globals.css', '/app.js'
  // Icons that are commonly used
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Check if we received a valid response to cache
        // We also check if the request is for an extension, to avoid caching browser extension requests
        if (networkResponse && 
            networkResponse.status === 200 && 
            !event.request.url.includes('extension://')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        // fetch failed, could be offline
        console.warn('Network request failed, trying cache:', error);
        // If fetchPromise rejects (e.g. network error) and we have a cachedResponse,
        // we've already returned it. If not, this catch will propagate the error.
        // If cachedResponse was null, then this will effectively be the final error.
        if (cachedResponse) return cachedResponse; // Should have already been returned
        throw error; // Re-throw if no cache and network failed
      });

      // Return cached response if available, otherwise return fetch promise
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
