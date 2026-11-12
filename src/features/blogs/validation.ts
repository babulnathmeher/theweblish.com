import { z } from "zod";
import { legacyArticleSlugs, reservedSlugs } from "@/config/site";
import { canUseBlogSlug } from "@/features/blogs/visibility";
import { slugFromTitle } from "@/features/blogs/slug";

const blankable = (max: number) => z.string().trim().max(max, "Text is too long.").transform((value) => value || null);

export const blogInputSchema = z.object({
  title: z.string().trim().min(2, "Enter an article title (at least 2 characters).").max(255, "Title is too long."),
  slug: z.string().trim().toLowerCase().min(2, "Enter a URL slug (at least 2 characters).").max(191, "Slug is too long.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letters, numbers, and hyphens in the URL slug."),
  excerpt: blankable(1000),
  content: z.string().trim().max(200_000, "Article body is too long."),
  seoTitle: blankable(255),
  seoDescription: blankable(320),
  authorId: z.string().min(1, "Choose an author.").max(64, "Author selection is invalid."),
  coverMediaId: z.string().max(64, "Cover image selection is invalid.").transform((value) => value || null),
  publishedAt: z.string().refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
    const date = new Date(`${value}Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 16) === value;
  }, "Enter a valid UTC publication time.").transform((value) => value ? new Date(`${value}Z`) : null),
});

export type BlogInput = z.infer<typeof blogInputSchema>;
export type BlogActionState = { fields: Record<string, string>; message: string };
export const emptyBlogState: BlogActionState = { fields: {}, message: "" };

export function validateBlogInput(formData: FormData, intent: "save" | "publish" | "unpublish" = "save", existingSlug?: string) {
  const value = Object.fromEntries(
    ["title", "slug", "excerpt", "content", "seoTitle", "seoDescription", "authorId", "coverMediaId", "publishedAt"]
      .map((name) => [name, String(formData.get(name) ?? "")]),
  );
  if (formData.get("slugMode") === "auto" || !value.slug?.trim()) value.slug = slugFromTitle(value.title || "");
  else value.slug = slugFromTitle(value.slug);
  const result = blogInputSchema.safeParse(value);
  if (result.success) {
    const legacyUrl = legacyArticleSlugs.has(result.data.slug);
    const originalConfirmed = formData.get("legacyOriginalImport") === "yes";
    const importingOriginal = legacyUrl && !reservedSlugs.has(result.data.slug) && !existingSlug && intent === "save" && originalConfirmed;
    if (!canUseBlogSlug(result.data.slug, reservedSlugs, legacyArticleSlugs, existingSlug) && !importingOriginal) {
      return { success: false as const, fields: { slug: reservedSlugs.has(result.data.slug)
        ? "This URL is already used by a website page. Choose another slug."
        : "This URL is reserved. Confirm that you are importing the original article to use it." } };
    }
    if (legacyUrl && importingOriginal && !result.data.content) return { success: false as const, fields: { content: "Add the original article content before saving this reserved URL." } };
    if (legacyUrl && intent === "publish" && !originalConfirmed) return { success: false as const, fields: { slug: "Confirm that this is the original article before publishing it at the preserved URL." } };
    if (intent === "publish" && !result.data.content) return { success: false as const, fields: { content: "Add the article body before publishing." } };
    return { success: true as const, data: result.data };
  }
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "form");
    fields[field] ??= issue.message;
  }
  return { success: false as const, fields };
}
