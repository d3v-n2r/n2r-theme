{#-
  Service worker.

  Deliberately conservative. An aggressive cache on a blog means readers see yesterday's post and
  have no idea why, and a service worker outlives the page that installed it — a bad one is a bug
  you cannot take back. So:

    - Pages are network-first. A reader online always sees what was published; the cache is only
      consulted when the network fails, which is the offline case it exists for.
    - Static assets are cache-first. Fonts, styles, and images are what the network round trip is
      actually costing, and they change under a new build rather than in place.
    - The cache name carries the build year, and every other cache is deleted on activation, so an
      upgrade cannot leave a previous version's files behind to be served forever.
-#}
const CACHE = 'n2r-{{ site.year }}';

// Only same-origin GETs are touched. Anything cross-origin — a comment embed, an outbound image —
// goes straight to the network, where its own server decides how it is cached.
function mine(request) {
  return request.method === 'GET' && new URL(request.url).origin === self.location.origin;
}

function isAsset(url) {
  return new URL(url).pathname.startsWith('/assets/');
}

self.addEventListener('install', (event) => {
  // Take over as soon as the new worker is ready rather than waiting for every tab to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!mine(request)) return;

  if (isAsset(request.url)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
