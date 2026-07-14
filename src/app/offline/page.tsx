import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="container mx-auto flex max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <div className="flex size-16 items-center justify-center rounded-2xl border bg-muted/40">
        <WifiOff className="size-8 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        You&apos;re offline
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        We couldn&apos;t load this page. Check your connection — recently viewed
        content may still be available.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/">Try again</Link>
        </Button>
      </div>
    </main>
  );
}
