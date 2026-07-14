"use client";

import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { BookOpen, Search, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchOverlay from "./SearchOverlay";
import { NotificationDropdown } from "./NotificationDropdown";
import { DevToolsDropdown } from "./DevToolsDropdown";
// Cache removed - using regular fetch for fresh data

export default function GlobalHeader() {
  const { isSignedIn, user } = useUser();
  const [userProfile, setUserProfile] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSignedIn) return;

      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();

        if (data.success) {
          setUserProfile(data.user || null);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [isSignedIn, user?.id]); // Re-fetch when user ID changes

  // Don't render the header at all when not signed in
  if (!isSignedIn) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-700 shadow-2xl border-b-4 border-white/20 dark:border-gray-800/20">
      <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center space-x-1.5 sm:space-x-2"
          >
            <div className="shrink-0 rounded-lg bg-white/20 p-1.5 backdrop-blur-sm dark:bg-gray-800/30 sm:rounded-xl sm:p-2">
              <BookOpen className="h-5 w-5 text-white drop-shadow-lg sm:h-6 sm:w-6" />
            </div>
            <span className="truncate text-base font-bold text-white drop-shadow-lg sm:text-xl">
              MangaTrack
            </span>
          </Link>

          {/* Navigation and User Section */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
            {/* Search Button */}
            <Button
              onClick={() => setIsSearchOpen(true)}
              variant="outline"
              size="sm"
              aria-label="Search"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:text-white dark:hover:bg-gray-700/40 transition-all duration-300 sm:hover:scale-105 sm:hover:shadow-lg backdrop-blur-sm px-2 sm:px-3"
            >
              <Search className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Search</span>
            </Button>

            {/* Notifications Button */}
            <NotificationDropdown />

            {/* Dev Tools Button */}
            <DevToolsDropdown />

            {/* Settings Button */}
            <Link href="/settings">
              <Button
                variant="outline"
                size="sm"
                aria-label="Settings"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:text-white dark:hover:bg-gray-700/40 transition-all duration-300 sm:hover:scale-105 sm:hover:shadow-lg backdrop-blur-sm p-2"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>

            {/* Premium Badge */}
            {userProfile?.tier === "PREMIUM" && (
              <div className="relative group hidden sm:block">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-full p-2 transition-all duration-300 transform hover:scale-110 hover:shadow-lg">
                  <Crown className="h-5 w-5" />
                </div>
              </div>
            )}

            {/* User Button */}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-7 h-7 sm:w-8 sm:h-8",
                  userButtonPopoverCard:
                    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg",
                  userButtonPopoverActionButton:
                    "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                  userButtonPopoverFooter: "hidden",
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
}
