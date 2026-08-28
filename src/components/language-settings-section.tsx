"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";

export function LanguageSettingsSection() {
  const t = useTranslations("settings");

  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">{t("languageTitle")}</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {t("languageDescription")}
      </p>
      <LanguageSwitcher />
    </section>
  );
}
