"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        style: {
          background: theme === "dark" ? "#1f2937" : "#ffffff",
          color: theme === "dark" ? "#f9fafb" : "#111827",
          border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
        },
        descriptionStyle: {
          color: theme === "dark" ? "#d1d5db" : "#6b7280",
        },
      }}
      style={
        {
          "--normal-bg": theme === "dark" ? "#1f2937" : "#ffffff",
          "--normal-text": theme === "dark" ? "#f9fafb" : "#111827",
          "--normal-border": theme === "dark" ? "#374151" : "#e5e7eb",
          "--success-bg": theme === "dark" ? "#064e3b" : "#ecfdf5",
          "--success-text": theme === "dark" ? "#a7f3d0" : "#065f46",
          "--success-border": theme === "dark" ? "#047857" : "#10b981",
          "--error-bg": theme === "dark" ? "#7f1d1d" : "#fef2f2",
          "--error-text": theme === "dark" ? "#fca5a5" : "#dc2626",
          "--error-border": theme === "dark" ? "#dc2626" : "#ef4444",
          "--warning-bg": theme === "dark" ? "#78350f" : "#fffbeb",
          "--warning-text": theme === "dark" ? "#fcd34d" : "#d97706",
          "--warning-border": theme === "dark" ? "#f59e0b" : "#f59e0b",
          "--info-bg": theme === "dark" ? "#1e3a8a" : "#eff6ff",
          "--info-text": theme === "dark" ? "#93c5fd" : "#2563eb",
          "--info-border": theme === "dark" ? "#3b82f6" : "#3b82f6",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
