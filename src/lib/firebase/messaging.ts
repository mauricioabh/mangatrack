"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import {
  getFirebaseVapidKey,
  getFirebaseWebConfig,
  isFirebaseWebConfigured,
} from "@/lib/firebase/config";

const SW_PATH = "/firebase-messaging-sw.js";
const TOKEN_STORAGE_KEY = "mangatrack_fcm_token";

let firebaseApp: FirebaseApp | undefined;
let messaging: Messaging | undefined;

function getOrInitApp(): FirebaseApp | null {
  const config = getFirebaseWebConfig();
  if (!config) {
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  const existing = getApps()[0];
  if (existing) {
    firebaseApp = existing;
    return firebaseApp;
  }

  firebaseApp = initializeApp(config);
  return firebaseApp;
}

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!(await isSupported())) {
    return null;
  }

  const app = getOrInitApp();
  if (!app) {
    return null;
  }

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register(SW_PATH, { scope: "/" });
}

export async function getStoredFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function storeFcmToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearStoredFcmToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function registerFcmPushToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  if (!isFirebaseWebConfigured()) {
    return {
      success: false,
      error: "Firebase web push is not configured (missing NEXT_PUBLIC_FIREBASE_* env).",
    };
  }

  const vapidKey = getFirebaseVapidKey();
  if (!vapidKey) {
    return { success: false, error: "Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY." };
  }

  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Notification permission denied." };
    }
  }

  const messagingInstance = await getMessagingInstance();
  if (!messagingInstance) {
    return {
      success: false,
      error: "Push messaging is not supported in this browser.",
    };
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    return { success: false, error: "Service worker registration failed." };
  }

  await navigator.serviceWorker.ready;

  const token = await getToken(messagingInstance, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    return { success: false, error: "Could not obtain FCM token." };
  }

  const response = await fetch("/api/user/push-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, platform: "WEB" }),
  });

  const data = (await response.json()) as { success?: boolean; error?: string };

  if (!response.ok || !data.success) {
    return {
      success: false,
      error: data.error ?? "Failed to save push token on server.",
    };
  }

  storeFcmToken(token);
  return { success: true, token };
}

export async function unregisterFcmPushToken(): Promise<{
  success: boolean;
  error?: string;
}> {
  const token = await getStoredFcmToken();
  if (token) {
    await fetch("/api/user/push-token", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  }

  clearStoredFcmToken();
  return { success: true };
}

export function subscribeToForegroundMessages(
  handler: (payload: { title?: string; body?: string; data?: Record<string, string> }) => void
): () => void {
  let unsubscribe = () => {};

  void (async () => {
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      return;
    }

    unsubscribe = onMessage(messagingInstance, (payload) => {
      const notification = payload.notification;
      handler({
        title: notification?.title,
        body: notification?.body,
        data: payload.data as Record<string, string> | undefined,
      });
    });
  })();

  return () => unsubscribe();
}
