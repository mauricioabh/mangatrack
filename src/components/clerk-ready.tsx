"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";

type ClerkReadyProps = {
  children: React.ReactNode;
};

type ClerkWithLoader = {
  loaded: boolean;
  load: () => Promise<void>;
};

export function ClerkReady({ children }: ClerkReadyProps) {
  const clerk = useClerk();
  const [isReady, setIsReady] = useState(clerk.loaded);

  useEffect(() => {
    if (clerk.loaded) {
      setIsReady(true);
      return;
    }

    let active = true;
    void (clerk as unknown as ClerkWithLoader)
      .load()
      .then(() => {
        if (active) setIsReady(true);
      })
      .catch(() => {
        if (active) setIsReady(false);
      });

    return () => {
      active = false;
    };
  }, [clerk]);

  if (!isReady) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-gray-600 dark:text-gray-300">
        Loading sign-in…
      </div>
    );
  }

  return children;
}
