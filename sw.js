/* 우리가족 미션 챌린지 - 서비스워커 (오프라인 캐시) */
var CACHE = 'hfm-cache-v4';
var ASSETS = [
  './prototype.html',
  './manifest.webmanifest',
  './navicons/appicon-192.png',
  './navicons/appicon-512.png'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS).catch(function () {}); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  // Supabase 등 외부 API는 항상 네트워크
  if (url.indexOf('supabase') > -1 || url.indexOf('/rest/') > -1 || url.indexOf('/realtime/') > -1) return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var net = fetch(e.request).then(function (res) {
        try { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); } catch (x) {}
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
