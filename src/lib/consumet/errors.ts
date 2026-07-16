export class ConsumetError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "ConsumetError";
  }
}

export class ConsumetConfigError extends ConsumetError {
  constructor(message: string) {
    super(message, 500, false);
    this.name = "ConsumetConfigError";
  }
}

export function isConsumetErrorPayload(
  body: unknown
): body is { message?: string; error?: string } {
  if (!body || typeof body !== "object") return false;
  const obj = body as Record<string, unknown>;
  const hasMessage = typeof obj.message === "string";
  const hasError = typeof obj.error === "string" || obj.error === true;
  const looksLikeSuccess =
    "results" in obj ||
    "chapters" in obj ||
    Array.isArray(body) ||
    ("id" in obj && ("title" in obj || "image" in obj));
  return (hasMessage || hasError) && !looksLikeSuccess;
}
