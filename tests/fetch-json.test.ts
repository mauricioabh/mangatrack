import { describe, expect, it } from "vitest";
import { parseJsonResponse } from "@/lib/fetch-json";

describe("parseJsonResponse", () => {
  it("parses application/json responses", async () => {
    const res = new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json" },
    });
    await expect(parseJsonResponse(res)).resolves.toEqual({ success: true });
  });

  it("rejects HTML error pages with a clear message", async () => {
    const res = new Response(
      '<meta name="viewport" content="width=device-width">',
      {
        status: 404,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
    await expect(parseJsonResponse(res)).rejects.toThrow(/Expected JSON/);
  });

  it("rejects an empty JSON response with a clear message", async () => {
    const res = new Response("", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    await expect(parseJsonResponse(res)).rejects.toThrow(/Invalid JSON/);
  });
});
