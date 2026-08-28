"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { persistThemeCookie } from "@/lib/theme-preference";
import { useUser } from "@clerk/nextjs";
import {
  BookOpen,
  User,
  Bell,
  CreditCard,
  Trash2,
  Moon,
  Sun,
  Crown,
} from "lucide-react";
import { captureEvent } from "@/components/providers/posthog-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { DeviceNotificationSettings } from "@/components/DeviceNotificationSettings";
import { LanguageSettingsSection } from "@/components/language-settings-section";
import { parseJsonResponse } from "@/lib/fetch-json";
import { useTranslations } from "next-intl";
// Cache removed - using regular fetch for fresh data

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  tier?: string;
  notifications?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  user?: T;
  preferences?: T;
  priceIds?: T;
  url?: string;
  error?: string;
}

export default function SettingsPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const t = useTranslations("settings");
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [priceIds, setPriceIds] = useState({ monthly: "", yearly: "" });
  const { theme, setTheme, resolvedTheme } = useTheme();
  const activeTheme = theme === "system" ? resolvedTheme : theme;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Make all API calls in parallel for fresh data every time
        const [userResponse, preferencesResponse, priceIdsResponse] =
          await Promise.all([
            fetch("/api/user/profile"),
            fetch("/api/user/preferences"),
            fetch("/api/stripe/price-ids"),
          ]);

        const [userData, preferencesData, priceIdsData] = await Promise.all([
          parseJsonResponse(userResponse),
          parseJsonResponse(preferencesResponse),
          parseJsonResponse(priceIdsResponse),
        ]);

        // Update user data
        const userApiResponse = userData as unknown as ApiResponse<UserData>;
        if (userApiResponse.success && userApiResponse.user) {
          setUser(userApiResponse.user);
          // Use Clerk user data if available, otherwise fallback to local data
          if (clerkUser) {
            setName(
              clerkUser.fullName ||
                clerkUser.firstName ||
                userApiResponse.user.name ||
                "",
            );
            setAvatar(clerkUser.imageUrl || userApiResponse.user.avatar || "");
          } else {
            setName(userApiResponse.user.name || "");
            setAvatar(userApiResponse.user.avatar || "");
          }
        }

        // Update preferences
        const preferencesApiResponse =
          preferencesData as unknown as ApiResponse<{
            emailNotifications: boolean;
          }>;
        if (
          preferencesApiResponse.success &&
          preferencesApiResponse.preferences
        ) {
          setNotifications(
            preferencesApiResponse.preferences.emailNotifications,
          );
        }

        // Update price IDs
        const priceIdsApiResponse = priceIdsData as unknown as ApiResponse<{
          monthly: string;
          yearly: string;
        }>;
        if (priceIdsApiResponse.success && priceIdsApiResponse.priceIds) {
          setPriceIds(priceIdsApiResponse.priceIds);
        }
      } catch (error) {
        console.error("Error fetching settings data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchAllData();
    }
  }, [isLoaded, clerkUser]);

  const handleUpdateProfile = async () => {
    if (!clerkUser) {
      toast.error(t("userNotAuthenticated"));
      return;
    }

    setUpdating(true);
    try {
      // Update Clerk user profile
      await clerkUser.update({
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
      });

      // Also update local database for app-specific data
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          avatar,
        }),
      });

      const data = await parseJsonResponse<ApiResponse<UserData>>(response);

      if (data.success && data.user) {
        setUser(data.user);
        toast.success(t("profileUpdated"));
      } else {
        toast.error(data.error || t("profileDataError"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("profileUpdateError"));
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePreferences = async (newNotifications: boolean) => {
    try {
      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailNotifications: newNotifications,
        }),
      });

      const data = await parseJsonResponse<
        ApiResponse<{
          emailNotifications: boolean;
        }>
      >(response);

      if (data.success) {
        setNotifications(newNotifications);
        toast.success(
          newNotifications
            ? t("notificationsEnabled")
            : t("notificationsDisabled"),
        );
      } else {
        toast.error(data.error || t("preferencesError"));
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  const handleUpgrade = async (priceId: string) => {
    if (!priceId) {
      toast.error(t("priceNotConfigured"));
      return;
    }

    try {
      toast.loading(t("checkoutCreating"));

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data =
        await parseJsonResponse<ApiResponse<{ url: string }>>(response);

      if (data.success && data.url) {
        toast.dismiss();
        captureEvent("premium_checkout_started");
        window.location.href = data.url;
      } else {
        toast.dismiss();
        toast.error(data.error || t("checkoutError"));
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.dismiss();
      toast.error(t("checkoutError"));
    }
  };

  const handleManageSubscription = async () => {
    try {
      toast.loading(t("portalCreating"));

      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      const data =
        await parseJsonResponse<ApiResponse<{ url: string }>>(response);

      if (data.success && data.url) {
        toast.dismiss();
        window.location.href = data.url;
      } else {
        toast.dismiss();
        toast.error(data.error || t("portalError"));
      }
    } catch (error) {
      console.error("Error creating portal:", error);
      toast.dismiss();
      toast.error(t("portalError"));
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      const data = await parseJsonResponse<ApiResponse<unknown>>(response);

      if (data.success) {
        toast.success(t("accountDeleted"));
        window.location.href = "/";
      } else {
        toast.error(data.error || t("deleteError"));
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(t("deleteError"));
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!clerkUser || !user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/30">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:via-blue-200 dark:to-purple-200 sm:mb-8 sm:text-3xl">
            {t("title")}
          </h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-gradient-to-r from-blue-50 to-purple-50 p-1 border border-blue-200 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800 sm:grid-cols-4">
              <TabsTrigger
                value="profile"
                className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 sm:text-sm"
              >
                {t("tabs.profile")}
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 sm:text-sm"
              >
                {t("tabs.preferences")}
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 sm:text-sm"
              >
                {t("tabs.billing")}
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-red-100/50 dark:hover:bg-red-900/30 sm:text-sm"
              >
                {t("tabs.danger")}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {t("profileTitle")}
                  </CardTitle>
                  <CardDescription>{t("profileDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>
                        {name ? name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {clerkUser.fullName || name || t("user")}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {clerkUser.primaryEmailAddress?.emailAddress ||
                          user?.email}
                      </p>
                      {user?.tier === "PREMIUM" ? (
                        <div className="relative group mt-1">
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full px-2 py-0.5 text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center space-x-1">
                            <Crown className="h-3 w-3" />
                            <span>{t("premium")}</span>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="mt-1">
                          {user?.tier} Plan
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t("displayName")}</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("displayNamePlaceholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar">{t("avatarUrl")}</Label>
                      <Input
                        id="avatar"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder={t("avatarUrlPlaceholder")}
                      />
                    </div>
                  </div>

                  <Button onClick={handleUpdateProfile} disabled={updating}>
                    {updating ? t("updating") : t("updateProfile")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    {t("preferencesTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("preferencesDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Label htmlFor="notifications">
                        {t("emailNotifications")}
                      </Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("emailNotificationsHint")}
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notifications}
                      onCheckedChange={handleUpdatePreferences}
                      className="shrink-0 self-start sm:self-auto"
                    />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <Label htmlFor="theme">{t("theme")}</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {t("themeHint")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          activeTheme === "light" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => {
                          persistThemeCookie("light");
                          setTheme("light");
                        }}
                        className={`flex-1 transition-all duration-300 sm:flex-none ${
                          activeTheme === "light"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                            : "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 hover:scale-105"
                        }`}
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        {t("themeLight")}
                      </Button>
                      <Button
                        variant={activeTheme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          persistThemeCookie("dark");
                          setTheme("dark");
                        }}
                        className={`flex-1 transition-all duration-300 sm:flex-none ${
                          activeTheme === "dark"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                            : "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 hover:scale-105"
                        }`}
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        {t("themeDark")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <LanguageSettingsSection />

              <DeviceNotificationSettings />
              <p className="text-sm text-muted-foreground px-1">
                {t("inAppAlertsHint")}
              </p>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    {t("billingTitle")}
                  </CardTitle>
                  <CardDescription>{t("billingDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {t("currentPlan")}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {user?.tier === "PREMIUM"
                          ? t("premiumPlanDesc")
                          : t("basicPlanDesc")}
                      </p>
                    </div>
                    {user?.tier === "PREMIUM" ? (
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full px-2 py-0.5 text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center space-x-1">
                          <Crown className="h-3 w-3" />
                          <span>{t("premium")}</span>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary">{user?.tier}</Badge>
                    )}
                  </div>

                  {user?.tier === "BASIC" ? (
                    <div className="space-y-6">
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === "development" && (
                        <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            <strong>{t("debugInfo")}:</strong>
                            <br />
                            {t("monthlyPriceId")}:{" "}
                            {priceIds.monthly || t("notSet")}
                            <br />
                            {t("yearlyPriceId")}:{" "}
                            {priceIds.yearly || t("notSet")}
                          </p>
                        </div>
                      )}

                      {/* Pricing Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Plan Card */}
                        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 sm:hover:scale-105 sm:hover:shadow-xl">
                          <div className="p-5 sm:p-8">
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {t("monthlyPlan")}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">
                                {t("monthlyPlanDescription")}
                              </p>
                            </div>

                            <div className="text-center mb-8">
                              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                $9.99
                              </div>
                              <div className="text-gray-600 dark:text-gray-300 text-sm">
                                {t("perMonth")}
                              </div>
                            </div>

                            <div className="space-y-3 mb-8">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                {t("unlimitedBookmarks")}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                {t("prioritySupport")}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                {t("advancedReading")}
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                {t("earlyAccess")}
                              </div>
                            </div>

                            <Button
                              onClick={() => handleUpgrade(priceIds.monthly)}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 py-3 text-base font-semibold"
                              disabled={!priceIds.monthly}
                            >
                              {t("startMonthly")}
                            </Button>
                          </div>
                        </div>

                        {/* Yearly Plan Card - Featured */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl transition-all duration-300 sm:hover:scale-105 sm:hover:shadow-2xl">
                          {/* Popular Badge */}
                          <div className="absolute top-0 right-0 rounded-bl-lg bg-yellow-400 px-4 py-1 text-xs font-bold text-yellow-900">
                            {t("popular")}
                          </div>

                          <div className="p-5 text-white sm:p-8">
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold mb-2">
                                {t("yearlyPlan")}
                              </h3>
                              <p className="text-purple-100 text-sm">
                                {t("yearlyPlanDescription")}
                              </p>
                            </div>

                            <div className="text-center mb-8">
                              <div className="text-4xl font-bold mb-1">
                                $99.99
                              </div>
                              <div className="text-purple-100 text-sm">
                                {t("perYear")}
                              </div>
                              <div className="mt-2">
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                  {t("savePercent")}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 mb-8">
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                {t("everythingMonthly")}
                              </div>
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                {t("priorityFeatureRequests")}
                              </div>
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                {t("advancedAnalytics")}
                              </div>
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                {t("customThemes")}
                              </div>
                            </div>

                            <Button
                              onClick={() => handleUpgrade(priceIds.yearly)}
                              className="w-full bg-white text-purple-600 hover:bg-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 py-3 text-base font-semibold"
                              disabled={!priceIds.yearly}
                            >
                              {t("startYearly")}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleManageSubscription}
                      variant="outline"
                      className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      {t("manageSubscription")}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Tab */}
            <TabsContent value="danger" className="space-y-6">
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600 dark:text-red-400">
                    <Trash2 className="h-5 w-5 mr-2" />
                    {t("dangerTitle")}
                  </CardTitle>
                  <CardDescription>{t("dangerDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      {t("deleteAccountTitle")}
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                      {t("deleteAccountDescription")}
                    </p>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="w-full"
                    >
                      {t("deleteAccount")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
