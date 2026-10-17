/* SignalFox Shift V2 — app-shell service worker.
   Pages are network-first (updates appear on next load when online);
   assets are cache-first. Everything falls back to cache offline. */
var CACHE = 'sfshift-v2-117';
var ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .catch(function () {})
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (e) {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url;
  try {
    url = new URL(e.request.url);
    /* Never intercept API calls — only the app's own files. */
    if (url.origin !== self.location.origin) return;
  } catch (err) { return; }
  var isPage = e.request.mode === 'navigate' ||
               url.pathname === '/' ||
               url.pathname.endsWith('/index.html');
  e.respondWith(
    isPage
      ? fetch(e.request.url, {cache:'no-store'}).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          return res;
        }).catch(function () {
          return caches.match(e.request).then(function (hit) {
            return hit || caches.match('index.html');
          });
        })
      : caches.match(e.request).then(function (hit) {
          return hit || fetch(e.request).catch(function () {
            return caches.match('index.html');
          });
        })
  );
});
