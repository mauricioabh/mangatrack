"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/lib/notificationService";

export function NotificationSettings() {
  const [notificationStatus, setNotificationStatus] = useState({
    isSupported: false,
    isGranted: false,
    permission: "default" as NotificationPermission,
  });
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      await notificationService.initialize();
      const status = notificationService.getBrowserNotificationStatus();
      setNotificationStatus(status);
    };

    checkStatus();
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationStatus((prev) => ({
          ...prev,
          isGranted: true,
          permission: "granted",
        }));
        await notificationService.showSystemNotification(
          "Notifications Enabled!",
          "You'll now receive browser notifications for new chapters and updates."
        );
      } else {
        setNotificationStatus((prev) => ({
          ...prev,
          permission: "denied",
        }));
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusBadge = () => {
    if (!notificationStatus.isSupported) {
      return <Badge variant="secondary">Not Supported</Badge>;
    }

    switch (notificationStatus.permission) {
      case "granted":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <Check className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive">
            <X className="h-3 w-3 mr-1" />
            Blocked
          </Badge>
        );
      default:
        return <Badge variant="outline">Not Set</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (notificationStatus.isGranted) {
      return <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    return <BellOff className="h-5 w-5 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>Browser Notifications</span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Control how you receive notifications about new chapters and manga
          updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Current Status</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!notificationStatus.isSupported ? (
              <p>Your browser doesn't support notifications.</p>
            ) : notificationStatus.isGranted ? (
              <p>
                ✅ You'll receive browser notifications for new chapters and
                updates.
              </p>
            ) : notificationStatus.permission === "denied" ? (
              <p>
                ❌ Notifications are blocked. You can enable them in your
                browser settings.
              </p>
            ) : (
              <p>
                ⚠️ Notifications are not enabled. Click the button below to
                enable them.
              </p>
            )}
          </div>
        </div>

        {notificationStatus.isSupported && !notificationStatus.isGranted && (
          <Button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="w-full"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Requesting Permission...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                Enable Browser Notifications
              </>
            )}
          </Button>
        )}

        {notificationStatus.isGranted && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Notifications are enabled!</strong> You'll receive browser
              notifications for:
            </p>
            <ul className="mt-2 text-sm text-green-700 dark:text-green-300 list-disc list-inside">
              <li>New chapters for your bookmarked manga</li>
              <li>Manga status updates</li>
              <li>System notifications</li>
            </ul>
          </div>
        )}

        {notificationStatus.permission === "denied" && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Notifications are blocked.</strong> To enable them:
            </p>
            <ol className="mt-2 text-sm text-red-700 dark:text-red-300 list-decimal list-inside">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Set notifications to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

