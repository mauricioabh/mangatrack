"use client";

import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import GlobalHeader from "./GlobalHeader";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const isReader = pathname?.startsWith("/reader") ?? false;
  const showHeader = Boolean(isSignedIn) && !isReader;

  return (
    <>
      {showHeader ? <GlobalHeader /> : null}
      <div className={showHeader ? "pt-14 sm:pt-16" : "pt-0"}>{children}</div>
    </>
  );
}
