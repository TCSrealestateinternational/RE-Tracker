// Minimal service worker for PWA installability
const CACHE = "re-tracker-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
  // Network-first for all requests — keeps the app always fresh
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
