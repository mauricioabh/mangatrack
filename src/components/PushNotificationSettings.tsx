"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getStoredFcmToken,
  registerFcmPushToken,
  unregisterFcmPushToken,
  subscribeToForegroundMessages,
} from "@/lib/firebase/messaging";
import { isFirebaseWebConfigured } from "@/lib/firebase/config";

export function PushNotificationSettings() {
  const [configured, setConfigured] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setConfigured(isFirebaseWebConfigured());
    void getStoredFcmToken().then((token) => {
      setEnabled(!!token);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return subscribeToForegroundMessages((payload) => {
      if (payload.title) {
        toast.info(payload.title, { description: payload.body });
      }
    });
  }, [enabled]);

  const handleEnable = async () => {
    setBusy(true);
    try {
      const result = await registerFcmPushToken();
      if (result.success) {
        setEnabled(true);
        toast.success("Push notifications enabled for this device.");
      } else {
        toast.error(result.error ?? "Failed to enable push notifications.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setBusy(true);
    try {
      const result = await unregisterFcmPushToken();
      if (result.success) {
        setEnabled(false);
        toast.success("Push notifications disabled for this device.");
      } else {
        toast.error(result.error ?? "Failed to disable push notifications.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          <span>Push Notifications (FCM)</span>
          {enabled ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Active
            </Badge>
          ) : (
            <Badge variant="outline">Off</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Receive alerts on this device when new chapters are published for manga
          in your library.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <p className="text-sm text-muted-foreground">
            Firebase is not configured. Add the{" "}
            <code className="text-xs">NEXT_PUBLIC_FIREBASE_*</code> variables to{" "}
            <code className="text-xs">.env.local</code> (see{" "}
            <code className="text-xs">docs/FIREBASE_SETUP.md</code>).
          </p>
        ) : enabled ? (
          <>
            <p className="text-sm text-muted-foreground">
              This browser is registered for push. New chapters (es / es-la / en)
              will trigger notifications via Inngest + Firebase.
            </p>
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={busy}
              className="w-full"
            >
              <BellOff className="h-4 w-4 mr-2" />
              {busy ? "Updating..." : "Disable push on this device"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Enable push to save your FCM token and receive notifications even
              when the tab is in the background.
            </p>
            <Button onClick={handleEnable} disabled={busy} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              {busy ? "Enabling..." : "Enable push notifications"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
