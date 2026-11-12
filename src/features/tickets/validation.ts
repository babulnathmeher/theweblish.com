import { z } from "zod";
import { requiredPhoneSchema } from "@/features/public-forms/phone";

const requiredHttpUrl = z.string().trim()
  .min(1, "Enter your website URL.")
  .max(2048, "Website URL is too long.")
  .url("Enter a valid website URL, including https://.")
  .refine((value) => /^https?:\/\//i.test(value), "Use a website URL beginning with http:// or https://.");

export const ticketSchema = z.strictObject({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(191, "Name is too long."),
  email: z.email("Enter a valid email address.").max(191, "Email address is too long."),
  phone: requiredPhoneSchema,
  websiteUrl: requiredHttpUrl,
  category: z.enum(["Website issue", "Access issue", "Content update", "Other"], { error: "Choose an issue type." }),
  subject: z.string().trim().min(5, "Add a short subject (at least 5 characters).").max(255, "Subject is too long."),
  description: z.string().trim().min(20, "Please describe the problem in at least 20 characters.").max(4000, "Description is too long."),
  sourcePage: z.url("Invalid source page.").max(2048, "Source page is too long."),
  consent: z.literal(true, { error: "Please agree to be contacted." }),
  website: z.string().max(0, "Invalid form submission.").optional().default(""),
});

export type TicketInput = z.infer<typeof ticketSchema>;

export function validateTicket(value: unknown) {
  const result = ticketSchema.safeParse(value);
  if (result.success) return { success: true as const, data: result.data };
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) fields[String(issue.path[0] ?? "form")] ??= issue.message;
  return { success: false as const, fields };
}
