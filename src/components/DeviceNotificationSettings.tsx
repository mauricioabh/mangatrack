"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("notifications");
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
        toast.success(t("enableDevice"));
      } else {
        toast.error(result.error ?? t("unavailable"));
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
        toast.success(t("disableDevice"));
      } else {
        toast.error(result.error ?? t("unavailable"));
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return null;
  }

  const isDev = process.env.NODE_ENV === "development";

  if (!configured && !isDev) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>{t("deviceTitle")}</span>
          {enabled ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {t("deviceOn")}
            </Badge>
          ) : (
            <Badge variant="outline">{t("deviceOff")}</Badge>
          )}
        </CardTitle>
        <CardDescription>{t("deviceDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("unavailable")}</p>
            {isDev ? (
              <p className="text-xs text-muted-foreground border-l-2 border-muted pl-3">
                Developer: Firebase web client env vars are not set. See{" "}
                <code className="text-xs">docs/FIREBASE_SETUP.md</code>.
              </p>
            ) : null}
          </div>
        ) : enabled ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t("enabledDescription")}
            </p>
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={busy}
              className="w-full"
            >
              <BellOff className="h-4 w-4 mr-2" />
              {busy ? t("updating") : t("disableDevice")}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t("enableDescription")}
            </p>
            <Button onClick={handleEnable} disabled={busy} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              {busy ? t("enabling") : t("enableDevice")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
