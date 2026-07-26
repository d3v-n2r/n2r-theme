{#-
  Service worker.

  Deliberately conservative. An aggressive cache on a blog means readers see yesterday's post and
  have no idea why, and a service worker outlives the page that installed it — a bad one is a bug
  you cannot take back. So:

    - Pages are network-first. A reader online always sees what was published; the cache is only
      consulted when the network fails, which is the offline case it exists for.
    - Static assets are served from the cache and refreshed behind it. They are what the network
      round trip is actually costing, so a reader should not wait for them — but a rebuilt
      stylesheet has to reach them eventually, and the cached copy is replaced as soon as the
      background fetch lands.
    - The cache name carries the build year, and every other cache is deleted on activation, so an
      upgrade cannot leave a previous version's files behind to be served forever.

  Assets were cache-first with no revalidation, which was a mistake: the cache name only changes
  once a year, so the first copy of `main.css` a browser saw was the copy it kept until January.
  Every rebuilt stylesheet and script after that was invisible — to readers after a deploy, and to
  the author on every single local reload.
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
      caches.match(request).then((hit) => {
        // Started whether or not there was a hit, so the cached copy is always replaced by whatever
        // the current build is serving. A failure here is the offline case and leaves the cache be.
        const fresh = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => hit);

        // `waitUntil` keeps the refresh alive after the cached copy has been handed back, which is
        // the whole point: the reader waits for nothing and the next load is current.
        if (hit) event.waitUntil(fresh);
        return hit || fresh;
      })
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
