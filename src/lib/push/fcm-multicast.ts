import type { MulticastMessage } from "firebase-admin/messaging";

/**
 * Data-only FCM for web/PWA. Android Chrome often drops "notification"
 * payloads for installed PWAs; the service worker must call showNotification.
 */
export function buildChapterMulticastMessage(options: {
  tokens: string[];
  title: string;
  body: string;
  url: string;
  provider: string;
  externalMangaId: string;
  externalChapterId: string;
}): MulticastMessage {
  const {
    tokens,
    title,
    body,
    url,
    provider,
    externalMangaId,
    externalChapterId,
  } = options;

  return {
    tokens,
    data: {
      title,
      body,
      url,
      provider,
      externalMangaId,
      externalChapterId,
    },
    webpush: {
      headers: {
        Urgency: "high",
        TTL: "86400",
      },
      fcmOptions: {
        link: url,
      },
    },
    android: {
      priority: "high",
    },
  };
}
