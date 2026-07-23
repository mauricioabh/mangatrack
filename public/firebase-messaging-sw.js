/**
 * Legacy Firebase messaging SW.
 * Active PWA + FCM worker is /sw.js — keep this file so old registrations
 * still receive push until browsers migrate to the new controller.
 */
/* eslint-disable no-undef */
importScripts("/api/firebase/sw-config");
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js"
);

const PUSH_DEDUPE_MS = 5000;
const recentlyShownNotifications = new Map();

function notificationFromPayload(payload) {
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
        url: data.url || "/",
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
    (client) => client.visibilityState === "visible" || client.focused
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
    console.error("[firebase-messaging-sw]", err);
  }
}

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
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});

initFirebaseMessaging();
