const CACHE = "re-tracker-v2";
const STATIC_CACHE = "re-tracker-static-v1";

// App shell to pre-cache on install
const APP_SHELL = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Clean old caches
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET requests
  if (e.request.method !== "GET") return;

  // Firebase / API calls → network-first, no caching
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebaseapp.com") ||
    url.hostname.includes("firebase.google.com")
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Static assets (fonts, icons, images) → cache-first
  if (
    url.pathname.match(/\.(woff2?|ttf|otf|svg|png|jpg|ico|webp)$/) ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(e.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // JS/CSS bundles and HTML → network-first, cache fallback
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((cached) =>
          // Offline fallback: serve cached index.html for navigation requests
          cached || (e.request.mode === "navigate" ? caches.match("/index.html") : undefined)
        )
      )
  );
});
