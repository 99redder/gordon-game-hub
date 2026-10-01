/* Gordon Game Hub service worker (basic offline cache) */
const CACHE_NAME = 'gordon-game-hub-v25';
const ASSETS = [
  './',
  './index.html',
  './messages.html',
  './manifest.webmanifest',
  './messages-manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/snapshot-store.js',
  './gallery/',
  './gallery/index.html',
  './gallery/gallery.js',
  './gallery/gallery.css',
  './js/messages.js',
  './js/zoom-lock.js',
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
  './games/shape-words/',
  './games/shape-words/index.html',
  './games/shape-words/shape-words.js',
  './games/number-count/',
  './games/number-count/index.html',
  './games/number-count/number-count.js',
  './games/coloring/',
  './games/coloring/index.html',
  './games/coloring/coloring.js',
  './games/coloring/snapshot-feedback.js',
  './games/dress-up/',
  './games/dress-up/index.html',
  './games/dress-up/dress-up.js',
  './games/trace-trail/',
  './games/trace-trail/index.html',
  './games/trace-trail/trace-trail.js',
  './games/peekaboo-pairs/',
  './games/peekaboo-pairs/index.html',
  './games/peekaboo-pairs/peekaboo-pairs.js',
  './games/pet-parade/',
  './games/pet-parade/index.html',
  './games/pet-parade/pet-parade.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    // Activate when existing app windows close, preserving games in progress.
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('gordon-game-hub-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Installed launch URLs include ?source=pwa; the same offline page serves them.
    const cached = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh.ok && fresh.type === 'basic') await cache.put(req, fresh.clone());
      return fresh;
    } catch (error) {
      if (req.mode === 'navigate') {
        return new Response('This page is not available offline yet. Open the playroom while online first.', {
          status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
      throw error;
    }
  })());
});
