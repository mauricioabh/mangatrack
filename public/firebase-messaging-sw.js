/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js"
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
        const title =
          payload.notification?.title ?? "MangaTrack";
        const options = {
          body: payload.notification?.body ?? "",
          icon: "/favicon.ico",
          data: payload.data ?? {},
        };
        return self.registration.showNotification(title, options);
      });
    })
    .catch((err) => {
      console.error("[firebase-messaging-sw]", err);
    });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
});

initFirebaseMessaging();
