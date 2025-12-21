const CACHE_NAME = "gattini-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/main.js",
  "/manifest.json",
  "/assets/backgrounds/background.jpg",
  "/assets/sprites/cats/cat_virginia.png",
  "/assets/sprites/cats/cat_riccardo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
