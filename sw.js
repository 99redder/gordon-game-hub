/* Gordon Game Hub service worker (basic offline cache) */
const CACHE_NAME = 'gordon-game-hub-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      // cache same-origin navigations/assets
      const url = new URL(req.url);
      if (url.origin === self.location.origin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      // fallback to app shell
      if (req.mode === 'navigate') {
        return caches.match('./index.html');
      }
      throw e;
    }
  })());
});
