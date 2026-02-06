/* Gordon Game Hub service worker (basic offline cache) */
const CACHE_NAME = 'gordon-game-hub-v5';
const ASSETS = [
  './',
  './index.html',
  './messages.html',
  './manifest.webmanifest',
  './messages-manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/messages.js',
  './js/firebase-config.js',
  './js/app-check.js',
  './icons/icon.svg',
  './assets/music.mp3',
  './assets/MUSIC_LICENSE.txt',

  // Games
  './games/letter-pop/',
  './games/letter-pop/index.html',
  './games/letter-pop/letter-pop.js',
  './games/shape-safari/',
  './games/shape-safari/index.html',
  './games/shape-safari/shape-safari.js',
  './games/number-count/',
  './games/number-count/index.html',
  './games/number-count/number-count.js'
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

  // Don't cache Firebase API calls
  const reqUrl = new URL(req.url);
  if (reqUrl.hostname.includes('firebaseio.com') ||
      reqUrl.hostname.includes('googleapis.com')) {
    return;
  }

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
