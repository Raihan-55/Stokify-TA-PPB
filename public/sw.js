const CACHE_NAME = 'stokify-pwa-v1';
const APP_SHELL = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {});
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Don't try to handle non-GET requests or cross-origin (Supabase) API calls
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // For navigation requests, try cache-first then network
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((r) => r || fetch(req).then((res) => {
        // update cache
        caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', res.clone()));
        return res;
      })).catch(() => caches.match('/index.html')),
    );
    return;
  }

  // For other same-origin assets: cache-first with network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // cache fetched asset
          caches.open(CACHE_NAME).then((cache) => cache.put(req, res.clone()));
          return res;
        })
        .catch(() => null);
    }),
  );
});
