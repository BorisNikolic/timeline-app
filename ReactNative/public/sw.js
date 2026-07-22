/**
 * Pyramid Festival — web offline service worker (hand-written, no dependencies).
 *
 * Strategy:
 *  - Navigations: network-first (fresh when online) → cached app shell offline.
 *  - Same-origin static assets (_expo JS, fonts, images): stale-while-revalidate.
 *  - Cross-origin (Render API, GitHub Pages map): NOT intercepted — the app
 *    already serves schedule data from localStorage offline, and MapScreen falls
 *    back to its bundled map image.
 *
 * The bundle filenames are content-hashed and unknown here, so we cache at
 * runtime instead of precaching a fixed list. The client also posts the shell
 * URLs (index + main script) right after registration, so the FIRST online
 * visit is enough to make the app load offline afterwards.
 */
const CACHE = 'pyramid-web-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Client asks us to precache the current shell URLs on first load.
self.addEventListener('message', (event) => {
  const data = event.data;
  if (data && data.type === 'CACHE_URLS' && Array.isArray(data.urls)) {
    event.waitUntil((async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        data.urls.map((u) =>
          fetch(new Request(u, { cache: 'reload' }))
            .then((res) => (res && res.ok ? cache.put(u, res.clone()) : null))
            .catch(() => null)
        )
      );
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }
  if (url.origin !== self.location.origin) return; // leave API / remote map to the network

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone());
        return fresh;
      } catch {
        return (
          (await cache.match(req)) ||
          (await cache.match(self.registration.scope)) ||
          (await cache.match('./')) ||
          Response.error()
        );
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const network = fetch(req)
      .then((res) => { if (res && res.status === 200) cache.put(req, res.clone()); return res; })
      .catch(() => null);
    return cached || (await network) || Response.error();
  })());
});
