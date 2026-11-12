import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/config/site";
import { publishedFilter } from "@/features/blogs/visibility";
import { publishedServiceWhere, isNewManagedService } from "@/features/services/public";
import { isCoreServiceSlug, servicePath } from "@/features/services/validation";
import { serviceCmsEnabled } from "@/features/services/config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.blogPost.findMany({ where: publishedFilter(), select: { slug: true, updatedAt: true }, orderBy: { publishedAt: "desc" } });
  let services: { slug: string; updatedAt: Date }[] = [];
  if (serviceCmsEnabled()) {
    try {
      services = await prisma.service.findMany({ where: { ...publishedServiceWhere(), indexable: true }, select: { slug: true, updatedAt: true } });
    } catch {
      // Older sites can still build their sitemap when the service table is unavailable.
    }
  }
  if (!posts.length && !services.length) return [];
  const origin = siteUrl.replace(/\/$/, "");
  return [
    ...(posts.length ? [{ url: `${origin}/blog/`, changeFrequency: "weekly" as const }] : []),
    ...posts.map((post) => ({ url: `${origin}/${post.slug}/`, lastModified: post.updatedAt, changeFrequency: "monthly" as const })),
    ...services.filter((service) => isNewManagedService(service.slug) || isCoreServiceSlug(service.slug)).map((service) => ({ url: `${origin}${servicePath(service.slug)}`, lastModified: service.updatedAt, changeFrequency: "monthly" as const })),
  ];
}
