"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BookmarkButtonProps {
  provider: string;
  mangaId: string;
  isBookmarked: boolean;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}

export function BookmarkButton({
  provider,
  mangaId,
  isBookmarked,
  onBookmarkChange,
}: BookmarkButtonProps) {
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(isBookmarked);

  const handleBookmark = async () => {
    setLoading(true);

    try {
      const url = "/api/manga/bookmark";
      const method = bookmarked ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          mangaId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newBookmarkState = !bookmarked;
        setBookmarked(newBookmarkState);
        onBookmarkChange?.(newBookmarkState);

        toast.success(
          newBookmarkState
            ? "Manga bookmarked successfully!"
            : "Bookmark removed successfully!"
        );
      } else {
        toast.error(data.error || "Failed to update bookmark");
      }
    } catch (error) {
      console.error("Bookmark error:", error);
      toast.error("Failed to update bookmark");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={bookmarked ? "secondary" : "default"}
      className="flex items-center"
      onClick={handleBookmark}
      disabled={loading}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 mr-2" />
      ) : (
        <Bookmark className="h-4 w-4 mr-2" />
      )}
      {loading ? "Updating..." : bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
