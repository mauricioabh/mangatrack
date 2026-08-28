/** Parse JSON only when the response is actually JSON (avoids SyntaxError on HTML error pages). */
export async function parseJsonResponse<T = unknown>(
  res: Response,
): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const snippet = (await res.text()).slice(0, 120);
    throw new Error(
      `Expected JSON from ${res.url} but got ${res.status} ${contentType || "unknown"}: ${snippet}`,
    );
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error(`Invalid JSON from ${res.url} (${res.status})`);
  }
}
