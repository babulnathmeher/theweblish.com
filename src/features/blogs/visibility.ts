export function publishedFilter(now = new Date()) {
  return { status: "PUBLISHED" as const, publishedAt: { lte: now } };
}

export function canUseBlogSlug(slug: string, reserved: Set<string>, legacy: Set<string>, existingSlug?: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 191
    && !reserved.has(slug) && (!legacy.has(slug) || slug === existingSlug);
}
