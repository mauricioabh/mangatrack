"use client";

import { useUser } from "@clerk/nextjs";
import GlobalHeader from "./GlobalHeader";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const { isSignedIn } = useUser();

  return (
    <>
      <GlobalHeader />
      <div className={isSignedIn ? "pt-16" : "pt-0"}>{children}</div>
    </>
  );
}
