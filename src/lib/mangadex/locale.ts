import type { LocalizedString } from "./types";

const DEFAULT_PREFER = ["en", "es", "ja"];

export function pickLocalized(
  map: LocalizedString | undefined | null,
  prefer: string[] = DEFAULT_PREFER
): string {
  if (!map) return "";
  for (const lang of prefer) {
    const value = map[lang];
    if (value?.trim()) return value.trim();
  }
  const first = Object.values(map).find((v) => v?.trim());
  return first?.trim() ?? "";
}

export function getPreferredLanguages(): string[] {
  const env = process.env.MANGADEX_DEFAULT_LOCALE;
  if (env) return [env, ...DEFAULT_PREFER.filter((l) => l !== env)];
  return DEFAULT_PREFER;
}
