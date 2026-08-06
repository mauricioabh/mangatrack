# Firebase — push notifications (FCM)

MangaTrack uses **Firebase Cloud Messaging** for device push and **firebase-admin** on the server (Inngest function).

## 1. Firebase Console

1. [Firebase Console](https://console.firebase.google.com) → **Add project** (or use existing).
2. **Build → Cloud Messaging** — note that FCM is enabled by default on new projects.

## 2. Web app (client)

1. Project overview → **Add app** → **Web** (`</>`).
2. Register app nickname (e.g. `mangatrack-web`).
3. Copy the `firebaseConfig` object into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:..."
```

4. **Project settings → Cloud Messaging → Web configuration → Generate key pair** (VAPID):

```env
NEXT_PUBLIC_FIREBASE_VAPID_KEY="B..."
```

5. Restart `npm run dev`.

## 3. Service account (server / Inngest)

1. **Project settings → Service accounts** → **Generate new private key** (JSON).
2. Map to `.env.local` (same project as above):

```env
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`FIREBASE_PRIVATE_KEY`: paste as one line with `\n` between lines, in double quotes.

`FIREBASE_PROJECT_ID` can match `NEXT_PUBLIC_FIREBASE_PROJECT_ID`; if only the public one is set, the server falls back to it.

## 4. Enable push in the app

1. Sign in → **Settings → Preferences**.
2. Card **Push Notifications (FCM)** → **Enable push notifications**.
3. Allow browser permission when prompted.

This calls `POST /api/user/push-token` and stores the token in `user_push_tokens`.

## 5. Payload strategy (data-only)

Chapter pushes are **data-only** (`data.title` / `data.body` / `data.url`, no FCM `notification` block). Android Chrome often drops notification payloads for installed PWAs; the service worker must call `showNotification`.

| Context | Behavior |
|---------|----------|
| Background / closed PWA | SW `push` + `onBackgroundMessage` (deduped) → system shade |
| Foreground (tab visible) | Client `onMessage` → toast; SW skips system UI |
| Notification click | Opens `data.url` (reader) |

Shared builder: `src/lib/push/fcm-multicast.ts`.

## 6. Test end-to-end

### Production / preview (recommended for Android PWA)

Dev unregisters service workers when `NODE_ENV !== "production"`, so local `npm run dev` is a poor FCM testbed. Prefer a Vercel preview or production URL.

1. Sign in → **Settings** → enable push on the device/browser under test.
2. Install as PWA on Android Chrome (Add to Home screen) for the background case.
3. Force a send:
   - Inngest: invoke *Poll Consumet for new chapters on favorites* (set `lastNotifiedChapterId` older if needed), **or**
   - Manual: `npx dotenv -e .env.local -- npx tsx scripts/test-fcm-send.ts` (uses DB tokens + first favorite).
4. Expect: background → system notification; foreground → toast; tap → reader URL.

`POST /api/webhook/mangadex` returns **410 Gone** and is no longer used for chapter notifications.

## 7. Vercel production

Add all `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_*`, and existing Inngest vars to the Vercel project (Production + Preview if needed).

Service worker is served from `/sw.js` (static file in `public/`). Firebase config for the SW is loaded synchronously from `/api/firebase/sw-config` (required for reliable Android PWA background push). Legacy `/firebase-messaging-sw.js` remains for old registrations.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Card says Firebase not configured | Fill all `NEXT_PUBLIC_FIREBASE_*` + VAPID |
| No token / permission denied | Browser site settings → allow notifications |
| Inngest run fails on FCM step | Check `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` |
| `tokensSent: 0` | Enable push in Settings on that browser first |
| Background push works on desktop but not Android PWA | Confirm SW is `/sw.js` v5+, `/api/firebase/sw-config` returns JS, and send path is data-only |
| No foreground toast | Token stored + app open; title/body come from `data.*` |
