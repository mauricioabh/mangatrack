import { NextResponse } from "next/server";
import { getFirebaseWebConfig } from "@/lib/firebase/config";

/**
 * Sync-friendly Firebase config for the PWA service worker.
 * Served as JS so `importScripts('/api/firebase/sw-config')` can initialize
 * FCM before handling push (async fetch().then() breaks Android background).
 */
export async function GET() {
  const config = getFirebaseWebConfig();

  if (!config) {
    return new NextResponse("/* Firebase web config not configured */", {
      status: 503,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const body = `self.__FIREBASE_CONFIG__=${JSON.stringify(config)};`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
