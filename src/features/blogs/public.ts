import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { reservedSlugs } from "@/config/site";
import { publishedFilter } from "@/features/blogs/visibility";

export const getPublishedPost = cache(async (slug: string) => {
  if (reservedSlugs.has(slug)) return null;
  return prisma.blogPost.findFirst({
    where: { slug, ...publishedFilter() },
    include: { author: { select: { name: true } }, coverMedia: { select: { url: true, altText: true } } },
  });
});
