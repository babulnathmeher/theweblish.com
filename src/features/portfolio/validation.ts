import { z } from "zod";
import { legacyArticleSlugs, reservedSlugs } from "@/config/site";
import { slugFromTitle } from "@/features/blogs/slug";

const optionalText = (max: number) => z.string().trim().max(max, "Text is too long.").transform((value) => value || null);

const portfolioInputSchema = z.object({
  title: z.string().trim().min(2, "Enter a project title.").max(255, "Title is too long."),
  slug: z.string().trim().min(2, "Enter a URL slug.").max(191, "Slug is too long.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  clientName: z.string().trim().max(191, "Client name is too long."),
  industry: optionalText(100),
  services: optionalText(255),
  projectUrl: z.string().trim().max(2048, "Project URL is too long.").refine((value) => {
    if (!value) return true;
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  }, "Enter a full HTTPS project URL.").transform((value) => value || null),
  summary: z.string().trim().max(2000, "Summary is too long."),
  challenge: z.string().trim().max(100_000, "Challenge is too long."),
  approach: z.string().trim().max(100_000, "Approach is too long."),
  outcome: optionalText(100_000),
  coverMediaId: z.string().max(64, "Invalid cover image.").transform((value) => value || null),
  seoTitle: optionalText(255),
  seoDescription: optionalText(320),
  indexable: z.boolean(),
});

export type PortfolioActionState = { fields: Record<string, string>; message: string };
export const emptyPortfolioState: PortfolioActionState = { fields: {}, message: "" };

export function validatePortfolioInput(formData: FormData, intent: "save" | "publish" | "unpublish" = "save", existingSlug?: string) {
  const names = ["title", "slug", "clientName", "industry", "services", "projectUrl", "summary", "challenge", "approach", "outcome", "coverMediaId", "seoTitle", "seoDescription"];
  const value = Object.fromEntries(names.map((name) => [name, String(formData.get(name) ?? "")]));
  value.slug = slugFromTitle(value.slug || value.title);
  const result = portfolioInputSchema.safeParse({ ...value, indexable: formData.get("indexable") === "on" });
  const fields: Record<string, string> = {};
  if (!result.success) {
    for (const issue of result.error.issues) fields[String(issue.path[0] ?? "form")] ??= issue.message;
    return { success: false as const, fields };
  }
  if (reservedSlugs.has(result.data.slug) || legacyArticleSlugs.has(result.data.slug)) fields.slug = "This URL slug is reserved. Choose another.";
  if (existingSlug && result.data.slug !== existingSlug) fields.slug = "Keep the existing case-study URL slug.";
  if (intent === "publish") {
    if (!result.data.clientName) fields.clientName = "Enter the verified client name.";
    if (result.data.summary.length < 20) fields.summary = "Add a useful project summary.";
    if (result.data.challenge.length < 30) fields.challenge = "Describe the client's brief and challenge.";
    if (result.data.approach.length < 30) fields.approach = "Describe the work completed.";
    if (formData.get("publicationApproved") !== "on") fields.publicationApproved = "Confirm permission to publish the client details and selected image.";
  }
  if (Object.keys(fields).length) return { success: false as const, fields };
  return { success: true as const, data: result.data };
}
