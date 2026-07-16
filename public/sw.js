/*
 * MangaTrack service worker (PWA).
 * Custom SW (no build-tool coupling) so it works with Next 15 + Turbopack.
 *
 * Strategy:
 *  - Navigations: network-first, fall back to cache, then /offline.
 *  - Next static assets / icons / fonts: cache-first.
 *  - Cover images (MangaDex CDN + same-origin): stale-while-revalidate (capped).
 *  - Safe API GET: network-first with cache fallback.
 *  - Firebase Cloud Messaging (background) via compat SDK.
 */

const VERSION = "v2";
const SHELL_CACHE = `mangatrack-shell-${VERSION}`;
const STATIC_CACHE = `mangatrack-static-${VERSION}`;
const IMAGE_CACHE = `mangatrack-images-${VERSION}`;
const API_CACHE = `mangatrack-api-${VERSION}`;

const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/icons/192", "/icons/512"];

const IMAGE_CACHE_LIMIT = 120;
const API_CACHE_LIMIT = 60;

/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);

function initFirebaseMessaging() {
  return fetch("/api/firebase/config")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Firebase config unavailable");
      }
      return res.json();
    })
    .then((config) => {
      if (!firebase.apps.length) {
        firebase.initializeApp(config);
      }
      const messaging = firebase.messaging();

      messaging.onBackgroundMessage((payload) => {
        const title = payload.notification?.title ?? "MangaTrack";
        const options = {
          body: payload.notification?.body ?? "",
          icon: "/icons/192",
          data: payload.data ?? {},
        };
        return self.registration.showNotification(title, options);
      });
    })
    .catch((err) => {
      console.error("[mangatrack-sw] firebase", err);
    });
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE, API_CACHE]);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/apple-icon" ||
    /\.(?:css|js|woff2?|ttf|otf)$/.test(url.pathname)
  );
}

function isImageRequest(request, url) {
  if (request.destination === "image") return true;
  return /\.(?:png|jpg|jpeg|gif|webp|svg|avif)$/.test(url.pathname);
}

function isRemoteCoverHost(hostname) {
  return (
    hostname === "uploads.mangadex.org" ||
    hostname.endsWith(".mangadex.network")
  );
}

function isCacheableApi(url) {
  if (!url.pathname.startsWith("/api/")) return false;
  if (
    url.pathname.startsWith("/api/webhook") ||
    url.pathname.startsWith("/api/webhooks") ||
    url.pathname.startsWith("/api/stripe") ||
    url.pathname.startsWith("/api/user") ||
    url.pathname.startsWith("/api/inngest") ||
    url.pathname.startsWith("/api/firebase")
  ) {
    return false;
  }
  return true;
}

async function trimCache(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  for (let i = 0; i < keys.length - limit; i += 1) {
    await cache.delete(keys[i]);
  }
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(SHELL_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;
    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        trimCache(cacheName, limit);
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

async function networkFirstApi(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(API_CACHE, API_CACHE_LIMIT);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (sameOrigin && isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  if (
    isImageRequest(request, url) &&
    (sameOrigin || isRemoteCoverHost(url.hostname))
  ) {
    event.respondWith(
      staleWhileRevalidate(request, IMAGE_CACHE, IMAGE_CACHE_LIMIT),
    );
    return;
  }

  if (sameOrigin && isCacheableApi(url)) {
    event.respondWith(networkFirstApi(request));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        const clientUrl = new URL(client.url);
        if (clientUrl.origin === self.location.origin && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })(),
  );
});

initFirebaseMessaging();
