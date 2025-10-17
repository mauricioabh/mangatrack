"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
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
import { NotificationSettings } from "@/components/NotificationSettings";

export default function SettingsPage() {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [priceIds, setPriceIds] = useState({ monthly: "", yearly: "" });
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
          // Use Clerk user data if available, otherwise fallback to local data
          if (clerkUser) {
            setName(
              clerkUser.fullName || clerkUser.firstName || data.user.name || ""
            );
            setAvatar(clerkUser.imageUrl || data.user.avatar || "");
          } else {
            setName(data.user.name || "");
            setAvatar(data.user.avatar || "");
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        const data = await response.json();

        if (data.success) {
          setNotifications(data.preferences.emailNotifications);
        }
      } catch (error) {
        console.error("Error fetching preferences:", error);
      }
    };

    const fetchPriceIds = async () => {
      try {
        const response = await fetch("/api/stripe/price-ids");
        const data = await response.json();

        if (data.success) {
          setPriceIds(data.priceIds);
        }
      } catch (error) {
        console.error("Error fetching price IDs:", error);
      }
    };

    if (isLoaded) {
      fetchUser();
      fetchPreferences();
      fetchPriceIds();
    }
  }, [isLoaded, clerkUser]);

  const handleUpdateProfile = async () => {
    if (!clerkUser) {
      toast.error("User not authenticated");
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

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update local profile data");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
          notifications: newNotifications,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotifications(newNotifications);
        toast.success(
          newNotifications
            ? "Email notifications enabled!"
            : "Email notifications disabled!"
        );
      } else {
        toast.error(data.error || "Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    }
  };

  const handleUpgrade = async (priceId: string) => {
    if (!priceId) {
      toast.error("Price ID not configured. Please contact support.");
      return;
    }

    try {
      toast.loading("Creating checkout session...");

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const data = await response.json();

      if (data.success && data.url) {
        toast.dismiss();
        window.location.href = data.url;
      } else {
        toast.dismiss();
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.dismiss();
      toast.error("Failed to create checkout session");
    }
  };

  const handleManageSubscription = async () => {
    try {
      toast.loading("Creating customer portal...");

      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success && data.url) {
        toast.dismiss();
        window.location.href = data.url;
      } else {
        toast.dismiss();
        toast.error(data.error || "Failed to create portal session");
      }
    } catch (error) {
      console.error("Error creating portal:", error);
      toast.dismiss();
      toast.error("Failed to create portal session");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account deleted successfully");
        window.location.href = "/";
      } else {
        toast.error(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading settings...
          </p>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-8">
            Settings
          </h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
              >
                Preferences
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
              >
                Billing
              </TabsTrigger>
              <TabsTrigger
                value="danger"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 hover:bg-red-100/50 dark:hover:bg-red-900/30"
              >
                Danger
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile information and avatar
                  </CardDescription>
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
                        {clerkUser.fullName || name || "User"}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {clerkUser.primaryEmailAddress?.emailAddress ||
                          (user as any)?.email}
                      </p>
                      {(user as any)?.tier === "PREMIUM" ? (
                        <div className="relative group mt-1">
                          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                          <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full px-2 py-0.5 text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center space-x-1">
                            <Crown className="h-3 w-3" />
                            <span>PREMIUM</span>
                          </div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="mt-1">
                          {(user as any)?.tier} Plan
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar">Avatar URL</Label>
                      <Input
                        id="avatar"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="Enter avatar URL"
                      />
                    </div>
                  </div>

                  <Button onClick={handleUpdateProfile} disabled={updating}>
                    {updating ? "Updating..." : "Update Profile"}
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
                    Preferences
                  </CardTitle>
                  <CardDescription>
                    Customize your reading experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Receive notifications for new chapters
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notifications}
                      onCheckedChange={handleUpdatePreferences}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Choose your preferred theme
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className={`transition-all duration-300 ${
                          theme === "light"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                            : "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 hover:scale-105"
                        }`}
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className={`transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                            : "border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 hover:scale-105"
                        }`}
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Browser Notifications Settings */}
              <NotificationSettings />
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Billing & Subscription
                  </CardTitle>
                  <CardDescription>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Current Plan
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {(user as any)?.tier === "PREMIUM"
                          ? "Premium - Unlimited bookmarks and features"
                          : "Basic - Up to 10 bookmarks"}
                      </p>
                    </div>
                    {(user as any)?.tier === "PREMIUM" ? (
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full px-2 py-0.5 text-sm font-semibold transition-all duration-300 transform hover:scale-110 hover:shadow-lg flex items-center space-x-1">
                          <Crown className="h-3 w-3" />
                          <span>PREMIUM</span>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary">{(user as any)?.tier}</Badge>
                    )}
                  </div>

                  {(user as any)?.tier === "BASIC" ? (
                    <div className="space-y-6">
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === "development" && (
                        <div className="p-3 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            <strong>Debug Info:</strong>
                            <br />
                            Monthly Price ID: {priceIds.monthly || "Not set"}
                            <br />
                            Yearly Price ID: {priceIds.yearly || "Not set"}
                          </p>
                        </div>
                      )}

                      {/* Pricing Cards */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Plan Card */}
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                          <div className="p-8">
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Monthly Plan
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Perfect for getting started with premium
                                features
                              </p>
                            </div>

                            <div className="text-center mb-8">
                              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                                $9.99
                              </div>
                              <div className="text-gray-600 dark:text-gray-300 text-sm">
                                per month
                              </div>
                            </div>

                            <div className="space-y-3 mb-8">
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                Unlimited manga bookmarks
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                Priority support
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                Advanced reading features
                              </div>
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                Early access to new features
                              </div>
                            </div>

                            <Button
                              onClick={() => handleUpgrade(priceIds.monthly)}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 py-3 text-base font-semibold"
                              disabled={!priceIds.monthly}
                            >
                              Start Monthly Plan →
                            </Button>
                          </div>
                        </div>

                        {/* Yearly Plan Card - Featured */}
                        <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                          {/* Popular Badge */}
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-xs font-bold rounded-bl-lg">
                            POPULAR
                          </div>

                          <div className="p-8 text-white">
                            <div className="text-center mb-6">
                              <h3 className="text-2xl font-bold mb-2">
                                Yearly Plan
                              </h3>
                              <p className="text-purple-100 text-sm">
                                Best value with significant savings
                              </p>
                            </div>

                            <div className="text-center mb-8">
                              <div className="text-4xl font-bold mb-1">
                                $99.99
                              </div>
                              <div className="text-purple-100 text-sm">
                                per year
                              </div>
                              <div className="mt-2">
                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                  Save 17%
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 mb-8">
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                Everything in Monthly Plan
                              </div>
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                Priority feature requests
                              </div>
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                Advanced analytics
                              </div>
                              <div className="flex items-center text-sm text-purple-100">
                                <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                                Custom themes
                              </div>
                            </div>

                            <Button
                              onClick={() => handleUpgrade(priceIds.yearly)}
                              className="w-full bg-white text-purple-600 hover:bg-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 active:scale-95 py-3 text-base font-semibold"
                              disabled={!priceIds.yearly}
                            >
                              Start Yearly Plan →
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
                      Manage Subscription
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
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Delete Account
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain. This will permanently delete your
                      account, reading history, and all data.
                    </p>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="destructive"
                      className="w-full"
                    >
                      Delete Account
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
