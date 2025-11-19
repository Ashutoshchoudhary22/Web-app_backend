import { z } from "zod";

export const codeRegex = /^[A-Za-z0-9]{6,8}$/;

export const createLinkSchema = z.object({
  url: z
    .string({ required_error: "Target URL is required" })
    .url("Enter a valid URL (https://...)")
    .max(2048, "URL is too long"),
  code: z
    .string()
    .min(6, "Code must be 6-8 characters")
    .max(8, "Code must be 6-8 characters")
    .regex(codeRegex, "Use letters and numbers only")
    .optional()
    .or(z.literal(""))
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

