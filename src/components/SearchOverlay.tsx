"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "Enter":
        e.preventDefault();
        if (query.trim()) {
          // Navigate to search page with query
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          onClose();
        }
        break;
    }
  };

  // Handle search
  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 transform sm:top-20 sm:w-[calc(100%-2rem)]"
          >
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
              {/* Search Input */}
              <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-0 sm:px-6 sm:py-4">
                <div className="flex min-w-0 flex-1 items-center">
                  <Search className="mr-2 h-5 w-5 shrink-0 text-gray-400 sm:mr-4 sm:h-6 sm:w-6" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search manga..."
                    className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder-gray-500 dark:text-white dark:placeholder-gray-400 sm:text-xl"
                  />
                  <button
                    onClick={onClose}
                    className="ml-2 rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 sm:hidden"
                    aria-label="Close search"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-2 sm:ml-4">
                  <button
                    onClick={handleSearch}
                    disabled={!query.trim()}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:flex-none sm:px-6"
                  >
                    Search
                  </button>
                  <button
                    onClick={onClose}
                    className="hidden rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-700 sm:block"
                    aria-label="Close search"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Search Tips */}
              <div className="border-t border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900/50 sm:px-6 sm:py-4">
                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  <p>Type your search query and press Enter or click Search</p>
                  <p>
                    Press{" "}
                    <kbd className="rounded bg-gray-200 px-2 py-1 font-mono text-xs dark:bg-gray-700">
                      Esc
                    </kbd>{" "}
                    to close
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
