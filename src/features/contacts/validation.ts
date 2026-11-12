import { z } from "zod";
import { requiredPhoneSchema } from "@/features/public-forms/phone";

export const contactSchema = z.strictObject({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(191, "Name is too long."),
  email: z.email("Enter a valid email address.").max(191, "Email address is too long."),
  phone: requiredPhoneSchema,
  subject: z.string().trim().max(255, "Subject is too long.").optional().default(""),
  message: z.string().trim().min(10, "Please write at least 10 characters about your message.").max(4000, "Message is too long."),
  sourcePage: z.url("Invalid source page.").max(2048, "Source page is too long."),
  consent: z.literal(true, { error: "Please agree to be contacted." }),
  website: z.string().max(0, "Invalid form submission.").optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function validateContact(value: unknown) {
  const result = contactSchema.safeParse(value);
  if (result.success) return { success: true as const, data: result.data };
  const fields: Record<string, string> = {};
  for (const issue of result.error.issues) fields[String(issue.path[0] ?? "form")] ??= issue.message;
  return { success: false as const, fields };
}
