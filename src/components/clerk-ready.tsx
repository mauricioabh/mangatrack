"use client";

import { useEffect, useState } from "react";

type ClerkReadyProps = {
  children: React.ReactNode;
};

type ClerkWithLoader = {
  loaded: boolean;
  load: () => Promise<void>;
};

export function ClerkReady({ children }: ClerkReadyProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    const clerk = (window as unknown as { Clerk?: ClerkWithLoader }).Clerk;

    if (!clerk) return () => undefined;

    if (clerk.loaded) {
      setIsReady(true);
    } else {
      void clerk
        .load()
        .then(() => {
          if (active) setIsReady(true);
        })
        .catch(() => {
          if (active) setIsReady(false);
        });
    }

    return () => {
      active = false;
    };
  }, []);

  if (!isReady) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-gray-600 dark:text-gray-300">
        Loading sign-in…
      </div>
    );
  }

  return children;
}
