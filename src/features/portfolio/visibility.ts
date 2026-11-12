export function publishedPortfolioWhere(now = new Date()) {
  return { status: "PUBLISHED" as const, approvedAt: { not: null }, publishedAt: { lte: now } };
}
