const CACHE_NAME = 'terranio-v2';
const ASSETS = [
  '/terranio/',
  '/terranio/index.html',
  '/terranio/app-component.jsx',
  '/terranio/manifest.json',
  '/terranio/icon-192.png',
  '/terranio/icon-512.png',
  '/terranio/icon-180.png',
  '/terranio/favicon-32.png',
];

// Install: cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for CDN resources, cache-first for app assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // For CDN resources (React, Babel, fonts), try network first then cache
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // For our own assets, try cache first then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
