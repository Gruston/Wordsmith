/* WordSmith Service Worker
   Strategy: Cache-first for app shell, network-first for CDN scripts.
   Version bump here triggers cache refresh on update.
*/
const CACHE_NAME = 'wordsmith-v1';

/* Files to cache immediately on install (the app shell) */
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

/* CDN resources to cache when first fetched */
const CDN_HOSTS = [
  'unpkg.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

/* ── Install: precache the app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: remove old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: serve from cache when offline ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Skip non-GET requests */
  if (event.request.method !== 'GET') return;

  /* For CDN resources: cache-first (they are versioned and stable) */
  if (CDN_HOSTS.some(host => url.hostname.includes(host))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          /* Only cache valid responses */
          if (!response || response.status !== 200) return response;
          const toCache = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
          return response;
        }).catch(() => {
          /* Network failed and nothing in cache — return nothing gracefully */
          return new Response('', { status: 503 });
        });
      })
    );
    return;
  }

  /* For app shell files: cache-first, fall back to network */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      });
    })
  );
});
