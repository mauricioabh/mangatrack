"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
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

export function DeviceNotificationSettings() {
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
        toast.success("Notifications enabled on this device.");
      } else {
        toast.error(result.error ?? "Could not enable notifications.");
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
        toast.success("Notifications disabled on this device.");
      } else {
        toast.error(result.error ?? "Could not disable notifications.");
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
          <Bell className="h-5 w-5" />
          <span>Device notifications</span>
          {enabled ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              On
            </Badge>
          ) : (
            <Badge variant="outline">Off</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Get alerted when a new chapter is published for manga in your library.
          Works in the browser and syncs with the Android app on the same account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <p className="text-sm text-muted-foreground">
            Push is not configured on the server. Add Firebase env vars (see{" "}
            <code className="text-xs">docs/FIREBASE_SETUP.md</code>).
          </p>
        ) : enabled ? (
          <>
            <p className="text-sm text-muted-foreground">
              This device receives push alerts for new chapters (es / es-la / en).
              In-app history is also saved under the bell icon in the header.
            </p>
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={busy}
              className="w-full"
            >
              <BellOff className="h-4 w-4 mr-2" />
              {busy ? "Updating..." : "Turn off on this device"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Allow notifications in the browser, then register this device for push.
            </p>
            <Button onClick={handleEnable} disabled={busy} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              {busy ? "Enabling..." : "Enable on this device"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
