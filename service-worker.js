// Speichert nur die App-Dateien für den Offline-Betrieb. Einträge liegen im Browserspeicher und werden hier nicht berührt.
var CACHE_NAME = "fall-journal-v2";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

// Nur eigene App-Dateien: sofort aus dem Cache, im Hintergrund aktualisieren.
self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var netz = fetch(event.request).then(function (antwort) {
        if (antwort && antwort.ok) {
          var kopie = antwort.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, kopie); });
        }
        return antwort;
      }).catch(function () { return cached; });
      return cached || netz;
    })
  );
});
