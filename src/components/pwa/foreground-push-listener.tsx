"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import {
  getStoredFcmToken,
  subscribeToForegroundMessages,
} from "@/lib/firebase/messaging";

/**
 * Listens for FCM while the PWA/tab is open (any page, not only Settings).
 */
export function ForegroundPushListener() {
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    void getStoredFcmToken().then((token) => {
      if (!active || !token) {
        return;
      }
      unsubscribe = subscribeToForegroundMessages((payload) => {
        if (payload.title) {
          toast.info(payload.title, { description: payload.body });
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return null;
}
