import {
  applySearchRelevance,
  matchesExactPhrase,
  normalizeSearchText,
  parseSearchQuery,
  resolveMatchMode,
  resolveSearchProviders,
  scoreTitleRelevance,
} from "@/lib/consumet/search-relevance";

describe("normalizeSearchText", () => {
  it("lowercases and strips accents/punctuation", () => {
    expect(normalizeSearchText("Démon Slayer!")).toBe("demon slayer");
  });
});

describe("parseSearchQuery", () => {
  it("detects quoted exact phrases", () => {
    expect(parseSearchQuery('"demon slayer"')).toEqual({
      query: "demon slayer",
      quotedExact: true,
    });
  });

  it("leaves unquoted queries alone", () => {
    expect(parseSearchQuery("demon slayer")).toEqual({
      query: "demon slayer",
      quotedExact: false,
    });
  });
});

describe("scoreTitleRelevance", () => {
  it("ranks exact and phrase matches above token-OR noise", () => {
    const q = "demon slayer";
    expect(scoreTitleRelevance("Demon Slayer", q)).toBeGreaterThan(
      scoreTitleRelevance("Demon King", q)
    );
    expect(scoreTitleRelevance("Demon Slayer: Kimetsu no Yaiba", q)).toBeGreaterThan(
      scoreTitleRelevance("Slayer Academy", q)
    );
    expect(scoreTitleRelevance("Demon King", q)).toBeLessThan(60);
  });

  it("scores all-token matches above partial", () => {
    const q = "one piece";
    expect(scoreTitleRelevance("The One Great Piece Saga", q)).toBe(60);
    expect(scoreTitleRelevance("One Punch Man", q)).toBeLessThan(60);
  });
});

describe("matchesExactPhrase", () => {
  it("requires the full phrase in the title", () => {
    expect(matchesExactPhrase("Demon Slayer", "demon slayer")).toBe(true);
    expect(matchesExactPhrase("Demon King", "demon slayer")).toBe(false);
    expect(
      matchesExactPhrase("The Demon Slayer Chronicles", "demon slayer")
    ).toBe(true);
  });
});

describe("applySearchRelevance", () => {
  const items = [
    { title: "Demon King" },
    { title: "Demon Slayer" },
    { title: "Slayer Wars" },
    { title: "Demon Slayer: Kimetsu no Yaiba" },
  ];

  it("sorts ranked mode by relevance", () => {
    const ranked = applySearchRelevance(items, "demon slayer", "ranked");
    expect(ranked[0].title).toBe("Demon Slayer");
    expect(ranked[1].title).toBe("Demon Slayer: Kimetsu no Yaiba");
  });

  it("filters exact mode to phrase matches", () => {
    const exact = applySearchRelevance(items, "demon slayer", "exact");
    expect(exact.map((i) => i.title)).toEqual([
      "Demon Slayer",
      "Demon Slayer: Kimetsu no Yaiba",
    ]);
  });
});

describe("resolveMatchMode", () => {
  it("forces exact when quotes are used", () => {
    expect(resolveMatchMode("ranked", true)).toBe("exact");
    expect(resolveMatchMode(undefined, false)).toBe("ranked");
    expect(resolveMatchMode("exact", false)).toBe("exact");
  });
});

describe("resolveSearchProviders", () => {
  const allowlist = ["mangahere", "mangapill"];

  it("returns allowlist when request is empty", () => {
    expect(resolveSearchProviders(allowlist, undefined)).toEqual(allowlist);
    expect(resolveSearchProviders(allowlist, [])).toEqual(allowlist);
  });

  it("intersects with allowlist and dedupes", () => {
    expect(
      resolveSearchProviders(allowlist, ["MangaPill", "unknown", "mangapill"])
    ).toEqual(["mangapill"]);
  });
});
