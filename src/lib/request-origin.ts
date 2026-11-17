type OriginEnvironment = {
  NEXT_PUBLIC_SITE_URL?: string;
  BETTER_AUTH_URL?: string;
  NODE_ENV?: string;
};

function configuredOrigins(environment: OriginEnvironment): Set<string> {
  const origins = new Set<string>();
  for (const value of [environment.NEXT_PUBLIC_SITE_URL, environment.BETTER_AUTH_URL]) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if (["http:", "https:"].includes(url.protocol) && !url.username && !url.password) origins.add(url.origin);
    } catch {
      // Invalid deployment values are rejected by leaving them out of the allowlist.
    }
  }
  return origins;
}

export function trustedRequestOrigin(request: Request, environment: OriginEnvironment = process.env): string | null {
  const value = request.headers.get("origin");
  if (!value) return null;
  let origin: string;
  try {
    const url = new URL(value);
    if (value !== url.origin || !["http:", "https:"].includes(url.protocol)) return null;
    origin = url.origin;
  } catch {
    return null;
  }

  if (configuredOrigins(environment).has(origin)) return origin;
  if (environment.NODE_ENV !== "production" && origin === new URL(request.url).origin) return origin;
  return null;
}
