/* STRIV service worker: navigasi network-first (biar update langsung tampil), aset cache-first. Bump VER untuk paksa update. */
var VER = 'striv-v8';
var SHELL = ['/', '/lab/', '/tools/', '/coaching/', '/community/', '/about/', '/manifest.webmanifest',
  '/hero-home-1.webp', '/hero-home-2.webp', '/hero-home-3.webp', '/hero-lab-1.webp', '/hero-lab-2.webp',
  '/hero-coaching-1.webp', '/hero-community-1.webp', '/hero-tools-1.webp', '/hero-about-1.webp', '/hero-store-1.webp'];
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VER).then(function (c) {
      return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== VER; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(function (res) {
        var copy = res.clone();
        caches.open(VER).then(function (c) { c.put(r, copy); });
        return res;
      }).catch(function () {
        return caches.match(r).then(function (hit) { return hit || caches.match('/'); });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(r).then(function (hit) {
      if (hit) return hit;
      return fetch(r).then(function (res) {
        var copy = res.clone();
        caches.open(VER).then(function (c) { c.put(r, copy); });
        return res;
      });
    })
  );
});
