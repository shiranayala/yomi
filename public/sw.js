const CACHE = 'yomi-v3';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // HTML navigation: show the cached app instantly, refresh the cache in the background
  // (a new deploy shows up on the next launch)
  if (e.request.mode === 'navigate') {
    const network = fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        e.waitUntil(caches.open(CACHE).then(c => c.put('/', copy)));
      }
      return res;
    });
    e.respondWith(
      caches.match('/').then(cached => cached ?? network.catch(() => Response.error()))
    );
    e.waitUntil(network.catch(() => {}));
    return;
  }

  // Hashed assets (/assets/...): cache first, immutable
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached ?? fetch(e.request).then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
      )
    );
    return;
  }

  // Everything else (logos, manifest, etc.): network first
  e.respondWith(
    fetch(e.request)
      .then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
