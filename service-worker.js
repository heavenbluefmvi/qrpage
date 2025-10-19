// service-worker.js
const CACHE_NAME = 'qrpage-cache-v1';
const ASSETS_TO_CACHE = [
  '/', // root (GitHub Pages sẽ map tới index.html)
  './index.html',
  './style.css',      // nếu có
  './script.js',      // nếu có
  './imgs/vietinbank.png',
  './imgs/momo.jpg',
  './imgs/techcom.jpg',
  './imgs/zalo.jpg'
];

// Install - cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(k => { if (k !== CACHE_NAME) return caches.delete(k); })
    )).then(() => self.clients.claim())
  );
});

// Fetch - respond from cache, fallback to network, then cache it
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // only cache requests from same origin and successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const respClone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
        return response;
      }).catch(() => {
        // optional: fallback for image requests
        if (event.request.destination === 'image') {
          return caches.match('/imgs/vietinbank.png'); // fallback image
        }
      });
    })
  );
});
