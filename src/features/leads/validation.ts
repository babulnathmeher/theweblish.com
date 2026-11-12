import { z } from "zod";

export const serviceInterests = ["business-website", "ecommerce", "landing-page", "redesign", "other"] as const;
export const budgetRanges = ["under-25000", "25000-50000", "50000-100000", "over-100000", "unsure"] as const;

export function normalizeIndianPhone(value: string): string | null {
  const compact = value.replace(/[\s()-]/g, "");
  const national = compact.startsWith("+91") && compact.length === 13 ? compact.slice(3)
    : compact.startsWith("91") && compact.length === 12 ? compact.slice(2)
    : compact.startsWith("0") && compact.length === 11 ? compact.slice(1)
    : compact;
  return /^[6-9]\d{9}$/.test(national) ? `+91${national}` : null;
}

const phoneSchema = z.string().max(30, "Mobile number is too long.").transform((value, context) => {
  const normalized = normalizeIndianPhone(value);
  if (!normalized) {
    context.addIssue({ code: "custom", message: "Enter a valid Indian mobile number." });
    return z.NEVER;
  }
  return normalized;
});

export const enquirySchema = z.strictObject({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(191, "Name is too long."),
  phone: phoneSchema,
  email: z.string().trim().max(191, "Email address is too long.").refine(
    (value) => !value || z.email().safeParse(value).success,
    "Enter a valid email address.",
  ).optional().transform((value) => value || null),
  serviceInterest: z.enum(serviceInterests, { error: "Choose a service." }),
  budgetRange: z.enum(budgetRanges, { error: "Choose a budget range." }),
  message: z.string().trim().max(2000, "Project details are too long.").optional().default(""),
  consent: z.literal(true, { error: "Please agree to be contacted." }),
  landingPageUrl: z.url().max(2048),
  utmSource: z.string().trim().max(191).optional().default(""),
  utmMedium: z.string().trim().max(191).optional().default(""),
  utmCampaign: z.string().trim().max(191).optional().default(""),
  utmTerm: z.string().trim().max(191).optional().default(""),
  utmContent: z.string().trim().max(191).optional().default(""),
  website: z.string().max(0).optional().default(""),
});

export type Enquiry = z.infer<typeof enquirySchema>;

export function validateEnquiry(value: unknown) {
  const result = enquirySchema.safeParse(value);
  if (result.success) return { success: true as const, data: result.data };
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "form");
    fields[field] ??= issue.message;
  }
  return { success: false as const, fields };
}
