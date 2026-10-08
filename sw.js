// Bootcamp Connect service worker (D028): makes the installed app open quickly and work offline.
// `npm run build` writes dist/sw.js with VERSION and PRECACHE filled in; this source copy is not
// registered (js/pwa.js only registers it on a built site).
//
// - Pages: network first, so a new deploy shows straight away; the cached app opens offline.
// - Files from this site (CSS, JS, icons, pdf.js): cached copy first, refreshed in the background.
// - Other sites (for example cdnjs) are never cached here.

const VERSION = 'dev';
const PRECACHE = [];
const CACHE = 'bootcamp-connect-' + VERSION;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('bootcamp-connect-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          if (response.ok) caches.open(CACHE).then(cache => cache.put('./', copy));
          return response;
        })
        .catch(() => caches.match('./', { ignoreSearch: true }))
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(cache => cache.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      });
      if (cached) { network.catch(() => {}); return cached; }
      return network;
    }))
  );
});
