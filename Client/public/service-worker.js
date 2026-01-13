self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("app-cache").then(cache =>
      cache.addAll(["/", "/index.html"])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

self.addEventListener("push", e => {
  const data = e.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
  });
});
