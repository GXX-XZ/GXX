/* gxx的空间 · 离线缓存（网络优先，断网时用缓存打开） */
var CACHE = 'gxx-space-v1';
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/style.css',
  './assets/core.js',
  './assets/app.js',
  './assets/news-data.js',
  './assets/view-today.js',
  './assets/view-habits.js',
  './assets/view-learn.js',
  './assets/view-fitness.js',
  './assets/view-work.js',
  './assets/view-news.js',
  './assets/view-media.js',
  './assets/view-mood.js',
  './assets/view-review.js',
  './icons/icon-180.png',
  './icons/icon-192.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match('./index.html');
      });
    })
  );
});
