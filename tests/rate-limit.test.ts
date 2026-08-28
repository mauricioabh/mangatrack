import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "vitest";
import { isUpstashConfigured, rateLimitSearch } from "@/lib/rate-limit";

const SEARCH_LIMIT_PER_MIN = 20;

describe("rate-limit", () => {
  it("reports whether Upstash REST credentials are set", () => {
    assert.equal(typeof isUpstashConfigured(), "boolean");
  });

  it.skipIf(!isUpstashConfigured())(
    "search allows requests under the sliding window then blocks",
    async () => {
      const userId = `rate-limit-qa-${randomUUID()}`;

      for (let i = 0; i < SEARCH_LIMIT_PER_MIN; i++) {
        const result = await rateLimitSearch(userId);
        assert.equal(result.limited, false, `request ${i + 1} should pass`);
      }

      const blocked = await rateLimitSearch(userId);
      assert.equal(blocked.limited, true);
      if (blocked.limited) {
        assert.ok(blocked.retryAfterSec > 0);
      }
    },
  );
});
