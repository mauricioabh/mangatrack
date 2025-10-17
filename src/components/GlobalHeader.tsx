"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { BookOpen, Search, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SearchOverlay from "./SearchOverlay";
import { NotificationDropdown } from "./NotificationDropdown";
import { DevToolsDropdown } from "./DevToolsDropdown";

export default function GlobalHeader() {
  const [user, setUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user/profile");
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-700 dark:via-purple-700 dark:to-indigo-700 shadow-2xl border-b-4 border-white/20 dark:border-gray-800/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 dark:bg-gray-800/30 rounded-xl backdrop-blur-sm">
              <BookOpen className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">
              MangaTrack
            </span>
          </Link>

          {/* Navigation and User Section */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button
              onClick={() => setIsSearchOpen(true)}
              variant="outline"
              size="sm"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:text-white dark:hover:bg-gray-700/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
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
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 dark:bg-gray-800/30 dark:border-gray-700/50 dark:text-white dark:hover:bg-gray-700/40 transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm p-2"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>

            {/* Premium Badge */}
            {user?.tier === "PREMIUM" && (
              <div className="relative group">
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
                  avatarBox: "w-8 h-8",
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
