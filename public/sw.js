const CACHE_NAME = "recuerdalo-pwa-v2";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest?v=2",
  "/favicon.png",
  "/logo-recuerdalo.png",
  "/icon-192.png?v=2",
  "/icon-512.png?v=2",
  "/icon-1024.png?v=2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // No interceptar llamadas a la API ni descargas de paquetes/APK
  if (
    url.pathname.startsWith("/apiproyectoeventos") ||
    url.pathname.startsWith("/api") ||
    url.pathname.endsWith(".apk") ||
    url.pathname.endsWith(".zip")
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone))
            .catch(() => {});
        }
        return networkResponse;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/"))
      )
  );
});

