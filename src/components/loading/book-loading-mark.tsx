import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type BookLoadingMarkProps = {
  /** Larger hero mark (e.g. cold book stage / search overlay) */
  size?: "md" | "lg";
  className?: string;
  /** Icon color classes; defaults suit dark reader chrome */
  tone?: "light" | "dark";
};

/**
 * Animated book mark with no status copy — shared by reader cold-path and search.
 */
export function BookLoadingMark({
  size = "lg",
  className,
  tone = "light",
}: BookLoadingMarkProps) {
  const hero = size === "lg";
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        hero ? "h-28 w-28" : "h-20 w-20",
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "animate-reader-book-glow absolute inset-0 rounded-full blur-xl",
          tone === "light" ? "bg-indigo-500/30" : "bg-blue-500/25"
        )}
      />
      <BookOpen
        className={cn(
          "animate-reader-book relative drop-shadow-lg",
          hero ? "h-20 w-20" : "h-14 w-14",
          tone === "light" ? "text-white" : "text-blue-600 dark:text-blue-300"
        )}
      />
    </div>
  );
}
