// public/service-worker.js
const CACHE_NAME = 'breatheeasy-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Add paths to icons that need to be cached for PWA experience
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/apple-touch-icon-152x152.png',
  '/icons/apple-touch-icon-180x180.png',
  '/icons/apple-touch-icon-167x167.png',
  '/icons/mstile-70x70.png',
  '/icons/mstile-150x150.png',
  '/icons/mstile-310x150.png',
  '/icons/mstile-310x310.png',
  '/favicon.ico', // If you have one
  // Note: Critical JS/CSS bundles are typically hashed by Next.js.
  // This service worker will cache them on first load via the fetch handler.
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching initial assets');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
      .catch(err => {
        console.error('Failed to open cache or add initial URLs:', err);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, try network first, then cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If network fetch is successful, cache it (optional, but good for subsequent offline access)
          if (response && response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(response => response || caches.match('/'))) // Fallback to cache, then to root
    );
    return;
  }

  // For other assets (CSS, JS, images), try cache first, then network.
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        });
      })
      .catch(error => {
        console.error('Service Worker fetch error:', error);
        // Optionally, provide a fallback for specific asset types if needed
        // For example, for images: return caches.match('/placeholder-image.png');
        throw error;
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});
