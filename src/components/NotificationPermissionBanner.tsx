"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { notificationService } from "@/lib/notificationService";

export function NotificationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isGranted, setIsGranted] = useState(false);

  useEffect(() => {
    const checkPermissionStatus = async () => {
      await notificationService.initialize();
      const status = notificationService.getBrowserNotificationStatus();

      // Only show banner if notifications are supported but not granted
      if (status.isSupported && !status.isGranted) {
        // Check if user has previously dismissed the banner
        const dismissed = localStorage.getItem("notification-banner-dismissed");
        if (!dismissed) {
          setIsVisible(true);
        }
      } else if (status.isGranted) {
        setIsGranted(true);
      }
    };

    checkPermissionStatus();
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);

    try {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setIsGranted(true);
        setIsVisible(false);
        // Show a success notification
        await notificationService.showSystemNotification(
          "Notifications Enabled!",
          "You'll now receive browser notifications for new chapters and updates."
        );
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("notification-banner-dismissed", "true");
  };

  if (!isVisible || isGranted) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Enable Browser Notifications
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-200">
              Get notified instantly when new chapters are released for your
              bookmarked manga.
            </p>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRequesting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Enabling...
                  </>
                ) : (
                  <>
                    <Bell className="h-3 w-3 mr-2" />
                    Enable Notifications
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDismiss}
                className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800/20"
              >
                <X className="h-3 w-3 mr-2" />
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
