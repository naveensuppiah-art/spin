self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("spin-cache").then((cache) => {
      return cache.addAll([
        "/spin-rewards/",
        "/spin-rewards/index.html",
        "/spin-rewards/style.css",
        "/spin-rewards/script.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});