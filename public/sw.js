// Service worker: makes the whole site work offline.
//
// Strategy: everything the app needs is precached on install. Requests are
// answered from the cache immediately (fast, and works with no signal), and
// refreshed from the network in the background. When a refreshed file differs
// from the cached one, open pages are told an update is ready.
//
// Bump VERSION to force every device to re-download the app shell.
const VERSION = "v1";
const APP_CACHE = `app-${VERSION}`;
const FONT_CACHE = "fonts-v1";

const APP_SHELL = [
  "/",
  "/css/styles.css",
  "/js/app.js",
  "/js/occasions.js",
  "/js/i18n.js",
  "/data/verses.json",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== APP_CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Google Fonts: stylesheet can change, font files never do.
  if (url.hostname === "fonts.googleapis.com") return event.respondWith(staleWhileRevalidate(req, FONT_CACHE, false));
  if (url.hostname === "fonts.gstatic.com") return event.respondWith(cacheFirst(req, FONT_CACHE));
  if (url.origin !== self.location.origin) return;

  // All pages are the same single-page app.
  if (req.mode === "navigate") return event.respondWith(staleWhileRevalidate(new Request("/"), APP_CACHE, true));
  event.respondWith(staleWhileRevalidate(req, APP_CACHE, true));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === "opaque") cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName, notify) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: true });
  const refresh = fetch(req)
    .then(async (res) => {
      if (!res.ok) return res;
      if (notify && hit && changed(hit, res)) announceUpdate();
      await cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit || offlineFallback(req));
  return hit || refresh;
}

function changed(oldRes, newRes) {
  const a = oldRes.headers.get("etag") || oldRes.headers.get("last-modified");
  const b = newRes.headers.get("etag") || newRes.headers.get("last-modified");
  return Boolean(a && b && a !== b);
}

let announced = false;
async function announceUpdate() {
  if (announced) return;
  announced = true;
  for (const client of await self.clients.matchAll({ type: "window" })) client.postMessage({ type: "update-ready" });
}

function offlineFallback(req) {
  if (req.mode === "navigate") return caches.match("/");
  return new Response("", { status: 503, statusText: "Offline" });
}
