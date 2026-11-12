import { z } from "zod";
import { servicePages, type ServiceSlug } from "@/config/service-pages";
import { legacyArticleSlugs, reservedSlugs } from "@/config/site";

export const serviceIcons = ["browser", "layout", "landing", "identity", "code", "editor", "search", "megaphone", "social", "analytics"] as const;
export const coreServiceSlugs = new Set<string>(Object.keys(servicePages));

export function isCoreServiceSlug(slug: string): slug is ServiceSlug {
  return coreServiceSlugs.has(slug);
}

export function servicePath(slug: string) {
  return isCoreServiceSlug(slug) ? `/${slug}/` : `/digital-solution/${slug}/`;
}

export function canUseServiceSlug(slug: string, legacySlug?: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  if (legacySlug) return isCoreServiceSlug(legacySlug) && slug === legacySlug;
  return !coreServiceSlugs.has(slug) && !reservedSlugs.has(slug) && !legacyArticleSlugs.has(slug);
}

export function isNewManagedService(slug: string) {
  return canUseServiceSlug(slug);
}

export function publishedServiceWhere(now = new Date()) {
  return { status: "PUBLISHED" as const, publishedAt: { lte: now } };
}

const blankable = (max: number) => z.string().trim().max(max, "Text is too long.").transform((value) => value || null);

const serviceInputSchema = z.object({
  title: z.string().trim().min(2, "Enter a service title.").max(255, "Title is too long."),
  slug: z.string().trim().toLowerCase().min(2, "Enter a URL slug.").max(191, "Slug is too long."),
  eyebrow: z.string().trim().min(2, "Enter a short label.").max(191, "Label is too long."),
  summary: z.string().trim().min(20, "Add a useful service summary.").max(2000, "Summary is too long."),
  content: z.string().trim().min(40, "Describe the service in more detail.").max(100_000, "Body is too long."),
  category: z.string().trim().min(2, "Enter a category.").max(100, "Category is too long."),
  icon: z.enum(serviceIcons, { error: "Choose an icon." }),
  seoTitle: blankable(255),
  seoDescription: blankable(320),
  indexable: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type ServiceActionState = { fields: Record<string, string>; message: string };
export const emptyServiceState: ServiceActionState = { fields: {}, message: "" };

export function validateServiceInput(formData: FormData, legacySlug?: string) {
  const value = Object.fromEntries(["title", "slug", "eyebrow", "summary", "content", "category", "icon", "seoTitle", "seoDescription"]
    .map((name) => [name, String(formData.get(name) ?? "")]));
  const result = serviceInputSchema.safeParse({ ...value, indexable: formData.get("indexable") === "on" });
  const fields: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) fields[String(issue.path[0] ?? "form")] ??= issue.message;
    return { success: false as const, fields };
  }
  if (!canUseServiceSlug(result.data.slug, legacySlug)) {
    return { success: false as const, fields: { slug: legacySlug ? "Keep the existing service URL." : "Use a unique URL slug that is not reserved." } };
  }
  return { success: true as const, data: result.data };
}
