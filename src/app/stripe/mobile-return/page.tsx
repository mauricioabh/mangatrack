"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function StripeMobileReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-6">
          <p className="text-muted-foreground text-center">Loading…</p>
        </main>
      }
    >
      <StripeMobileReturnContent />
    </Suspense>
  );
}

function StripeMobileReturnContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  useEffect(() => {
    const path = status === "success" ? "success" : "cancel";
    window.location.replace(`mangatrack://checkout/${path}`);
  }, [status]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p className="text-muted-foreground text-center">
        Returning to MangaTrack…
      </p>
    </main>
  );
}

