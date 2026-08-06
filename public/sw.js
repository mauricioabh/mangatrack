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

const VERSION = "v5";
const SHELL_CACHE = `mangatrack-shell-${VERSION}`;
const STATIC_CACHE = `mangatrack-static-${VERSION}`;
const IMAGE_CACHE = `mangatrack-images-${VERSION}`;
const API_CACHE = `mangatrack-api-${VERSION}`;

const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL, "/icons/192", "/icons/512"];

const IMAGE_CACHE_LIMIT = 120;
const API_CACHE_LIMIT = 60;
const PUSH_DEDUPE_MS = 5000;

/* eslint-disable no-undef */
/* Sync importScripts (not fetch().then) so FCM is ready when Android wakes the SW. */
importScripts("/api/firebase/sw-config");
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js",
);

/** Prevents double shade when both `push` and `onBackgroundMessage` fire. */
const recentlyShownNotifications = new Map();

function notificationFromPayload(payload) {
  // FCM may nest fields under data, or flatten them on the root.
  const data = {
    ...(payload?.data ?? {}),
  };
  const title =
    payload?.notification?.title ||
    data.title ||
    payload?.title ||
    "MangaTrack";
  const body =
    payload?.notification?.body || data.body || payload?.body || "";
  return {
    title,
    options: {
      body,
      icon: "/icons/192",
      badge: "/icons/192",
      tag: data.externalChapterId || data.tag || "mangatrack",
      renotify: true,
      requireInteraction: false,
      data: {
        ...data,
        url: data.url || payload?.fcmOptions?.link || "/",
      },
    },
  };
}

async function hasVisibleClient() {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  return clientList.some(
    (client) => client.visibilityState === "visible" || client.focused,
  );
}

async function showChapterNotification(title, options) {
  const key = `${options.tag}|${title}|${options.body}`;
  const now = Date.now();
  const prev = recentlyShownNotifications.get(key);
  if (prev != null && now - prev < PUSH_DEDUPE_MS) {
    return;
  }
  recentlyShownNotifications.set(key, now);
  for (const [k, t] of recentlyShownNotifications) {
    if (now - t >= PUSH_DEDUPE_MS) {
      recentlyShownNotifications.delete(k);
    }
  }
  await self.registration.showNotification(title, options);
}

function initFirebaseMessaging() {
  try {
    if (typeof self.__FIREBASE_CONFIG__ === "undefined") {
      throw new Error("Firebase SW config missing (__FIREBASE_CONFIG__)");
    }
    if (!firebase.apps.length) {
      firebase.initializeApp(self.__FIREBASE_CONFIG__);
    }
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const { title, options } = notificationFromPayload(payload);
      return showChapterNotification(title, options);
    });
  } catch (err) {
    console.error("[mangatrack-sw] firebase", err);
  }
}

/**
 * Fallback when FCM background handler is late (common on Android Chrome PWA).
 * Skip system UI when a visible tab will show a foreground toast via onMessage.
 */
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }
  event.waitUntil(
    (async () => {
      if (await hasVisibleClient()) {
        return;
      }
      let payload;
      try {
        payload = event.data.json();
      } catch {
        return;
      }
      const { title, options } = notificationFromPayload(payload);
      if (!title && !options.body) {
        return;
      }
      await showChapterNotification(title, options);
    })(),
  );
});

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
