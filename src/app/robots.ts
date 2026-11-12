import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (process.env.STAGING_NOINDEX === "true") return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] } };
}
