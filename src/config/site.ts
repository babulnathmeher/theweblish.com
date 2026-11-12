export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const publicPageSlugs = [
  "about-us", "our-clients", "customer-satisfaction", "digital-solution", "contact", "support", "blog",
  "web-design-company-in-bhubaneswar", "landing-page-design", "logo-design",
  "web-development-company-in-bhubaneswar", "wordpress-development-company-in-bhubaneswar",
  "seo-company-in-bhubaneswar", "marketing-company-in-bhubaneswar", "facebook-marketing",
  "google-analytics", "website-development",
] as const;

export const reservedSlugs = new Set<string>([
  ...publicPageSlugs, "admin", "api", "robots.txt", "sitemap.xml",
]);

// These URLs are held for audited content import and cannot be created in the editor.
export const legacyArticleSlugs = new Set<string>([
  "how-to-increase-leads-from-landing-pages",
  "how-to-create-seo-friendly-website",
  "how-to-get-traffic-on-your-website",
  "best-web-design-company-in-bhubaneswar",
  "the-ultimate-guide-to-website-design-trends",
  "ever-wondered-how-websites-work",
  "how-to-choose-a-perfect-domain-name-for-your-brand",
]);
