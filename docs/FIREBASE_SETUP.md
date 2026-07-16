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

## 5. Test end-to-end

With `npm run dev`, `npx inngest-cli@latest dev`, Firebase env set, and a manga in favorites:

1. Open http://localhost:8288 → **Functions** → *Poll Consumet for new chapters on favorites* → **Invoke**.
2. First run on a favorite without watermark → `seeded` (no flood). To force a push, set `lastNotifiedChapterId` in Neon to an older chapter id and Invoke again.
3. Check Inngest run → FCM steps; device should receive notification (foreground: toast; background: system notification via service worker).

`POST /api/webhook/mangadex` returns **410 Gone** and is no longer used for chapter notifications.

## 6. Vercel production

Add all `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_*`, and existing Inngest vars to the Vercel project (Production + Preview if needed).

Service worker is served from `/firebase-messaging-sw.js` (static file in `public/`).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Card says Firebase not configured | Fill all `NEXT_PUBLIC_FIREBASE_*` + VAPID |
| No token / permission denied | Browser site settings → allow notifications |
| Inngest run fails on FCM step | Check `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` |
| `tokensSent: 0` | Enable push in Settings on that browser first |
