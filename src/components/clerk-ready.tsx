"use client";

import { useEffect, useRef, useState } from "react";

type ClerkReadyProps = {
  mode: "signIn" | "signUp";
};

type ClerkAuthApi = {
  loaded: boolean;
  load: () => Promise<void>;
  mountSignIn: (element: HTMLElement) => void;
  mountSignUp: (element: HTMLElement) => void;
  unmountSignIn: () => void;
  unmountSignUp: () => void;
};

export function ClerkAuthForm({ mode }: ClerkReadyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let retryTimer: number | undefined;

    const mount = async () => {
      const clerk = (window as unknown as { Clerk?: ClerkAuthApi }).Clerk;
      const container = containerRef.current;

      if (!clerk || !container) {
        retryTimer = window.setTimeout(() => void mount(), 100);
        return;
      }

      try {
        if (!clerk.loaded) await clerk.load();
        if (!active || !containerRef.current) return;

        if (mode === "signIn") {
          clerk.mountSignIn(containerRef.current);
        } else {
          clerk.mountSignUp(containerRef.current);
        }
      } catch {
        if (active) setError(true);
      }
    };

    void mount();

    return () => {
      active = false;
      if (retryTimer) window.clearTimeout(retryTimer);

      const clerk = (window as unknown as { Clerk?: ClerkAuthApi }).Clerk;
      if (clerk) {
        if (mode === "signIn") {
          clerk.unmountSignIn();
        } else {
          clerk.unmountSignUp();
        }
      }
    };
  }, [mode]);

  if (error) {
    return (
      <div className="flex min-h-40 items-center justify-center text-sm text-gray-600 dark:text-gray-300">
        Unable to load authentication. Please refresh the page.
      </div>
    );
  }

  return <div ref={containerRef} />;
}
