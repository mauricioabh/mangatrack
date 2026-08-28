import en from "../messages/en.json";
import es from "../messages/es.json";
import { describe, expect, it } from "vitest";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("translation messages", () => {
  it("keeps English and Spanish JSON valid", () => {
    expect(en).toBeDefined();
    expect(es).toBeDefined();
  });

  it("keeps the same translation keys in every locale", () => {
    expect(keyPaths(es).sort()).toEqual(keyPaths(en).sort());
  });
});
