import { z } from "zod";

export const requiredPhoneSchema = z.string().trim()
  .min(1, "Enter your phone number.")
  .max(50, "Phone number is too long.")
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return /^[+\d\s().-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }, "Enter a valid phone number.");
