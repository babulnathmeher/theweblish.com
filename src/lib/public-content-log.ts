export function logPublicContentFailure(context: string, error: unknown) {
  const name = error instanceof Error ? error.name : "UnknownError";
  const code = error && typeof error === "object" && "code" in error && typeof error.code === "string" && /^P\d{4}$/.test(error.code)
    ? error.code
    : "UNKNOWN";
  const message = `${context}: ${name} (${code})`;

  // The public page already renders an unavailable state. Keep development's
  // error overlay for failures that are not handled by the page.
  if (process.env.NODE_ENV === "development") console.warn(message);
  else console.error(message);
}
