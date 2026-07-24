/**
 * Client-side ranking / exact filtering over Consumet search hits.
 * Upstream providers often tokenize with OR-like matching; we re-score locally.
 */

export type SearchMatchMode = "ranked" | "exact";

/** Strip accents / punctuation for stable title matching. */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSearchQuery(query: string): string[] {
  return normalizeSearchText(query).split(" ").filter(Boolean);
}

/**
 * Detect `"phrase"` wrapping → exact mode + inner query.
 * Unmatched quotes are treated as literal text.
 */
export function parseSearchQuery(raw: string): {
  query: string;
  quotedExact: boolean;
} {
  const trimmed = raw.trim();
  const match = trimmed.match(/^"([\s\S]+)"$/);
  if (match) {
    return { query: match[1].trim(), quotedExact: true };
  }
  return { query: trimmed, quotedExact: false };
}

/**
 * Higher is better. Exact title > prefix > phrase contains > all tokens > partial.
 */
export function scoreTitleRelevance(title: string, query: string): number {
  const nTitle = normalizeSearchText(title);
  const nQuery = normalizeSearchText(query);
  if (!nQuery || !nTitle) return 0;

  if (nTitle === nQuery) return 100;
  if (nTitle.startsWith(nQuery + " ") || nTitle.startsWith(nQuery)) return 90;
  if (nTitle.includes(nQuery)) return 80;

  const tokens = tokenizeSearchQuery(query);
  if (tokens.length === 0) return 0;

  const matched = tokens.filter((t) => nTitle.includes(t)).length;
  if (matched === tokens.length) return 60;
  if (matched === 0) return 0;
  return Math.round((matched / tokens.length) * 40);
}

/** Exact / phrase mode: full normalized query must appear in the title. */
export function matchesExactPhrase(title: string, query: string): boolean {
  const nTitle = normalizeSearchText(title);
  const nQuery = normalizeSearchText(query);
  if (!nQuery) return true;
  return nTitle.includes(nQuery);
}

export function resolveMatchMode(
  requested: SearchMatchMode | undefined,
  quotedExact: boolean
): SearchMatchMode {
  if (quotedExact) return "exact";
  return requested === "exact" ? "exact" : "ranked";
}

export function applySearchRelevance<T extends { title: string }>(
  items: T[],
  query: string,
  mode: SearchMatchMode
): T[] {
  const q = query.trim();
  if (!q) return items;

  if (mode === "exact") {
    return items
      .filter((item) => matchesExactPhrase(item.title, q))
      .sort(
        (a, b) =>
          scoreTitleRelevance(b.title, q) - scoreTitleRelevance(a.title, q)
      );
  }

  return [...items].sort((a, b) => {
    const scoreDiff =
      scoreTitleRelevance(b.title, q) - scoreTitleRelevance(a.title, q);
    if (scoreDiff !== 0) return scoreDiff;
    return a.title.localeCompare(b.title);
  });
}

/** Intersect requested providers with allowlist; empty request → full allowlist. */
export function resolveSearchProviders(
  allowlist: string[],
  requested?: string[] | null
): string[] {
  if (!requested || requested.length === 0) return allowlist;
  const allowed = new Set(allowlist.map((p) => p.toLowerCase()));
  const filtered = requested
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p && allowed.has(p));
  // Deduplicate while preserving order
  return [...new Set(filtered)];
}
