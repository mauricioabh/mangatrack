import { env } from "@/env";
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, Messaging } from "firebase-admin/messaging";

let firebaseApp: App | undefined;

function getFirebaseApp(): App {
  if (firebaseApp) {
    return firebaseApp;
  }

  const existing = getApps()[0];
  if (existing) {
    firebaseApp = existing;
    return firebaseApp;
  }

  const projectId =
    env.FIREBASE_PROJECT_ID ?? env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = env.FIREBASE_CLIENT_EMAIL;
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    );
  }

  firebaseApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return firebaseApp;
}

export function getFirebaseMessaging(): Messaging {
  return getMessaging(getFirebaseApp());
}
