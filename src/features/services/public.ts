import "server-only";
import { prisma } from "@/lib/prisma";
import { publishedServiceWhere } from "@/features/services/validation";
import { serviceCmsEnabled } from "@/features/services/config";

export { isNewManagedService, publishedServiceWhere } from "@/features/services/validation";

export async function getPublishedService(slug: string) {
  if (!serviceCmsEnabled()) return null;
  try {
    return await prisma.service.findFirst({ where: { slug, ...publishedServiceWhere() } });
  } catch {
    // Static service pages continue to work while the migration is pending.
    return null;
  }
}

export async function getPublishedServiceCards() {
  if (!serviceCmsEnabled()) return [];
  try {
    return await prisma.service.findMany({ where: publishedServiceWhere(), select: { slug: true, title: true, summary: true, category: true, icon: true }, orderBy: { createdAt: "asc" } });
  } catch {
    return [];
  }
}

