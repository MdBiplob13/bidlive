import { z } from "zod";

/**
 * Optional numeric field that tolerates empty inputs. Empty string / null /
 * undefined become `undefined` (so .optional() applies) instead of being
 * coerced to 0 by z.coerce.number(). `check` lets you require positive, etc.
 */
const optionalNumber = (check = (s) => s) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    check(z.coerce.number()).optional()
  );

/** Bangladeshi mobile: 11 digits starting 01, operator digit 3-9. */
export const bdPhone = z
  .string()
  .trim()
  .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi phone number (e.g. 01712345678)");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short").max(60),
    phone: bdPhone,
    password: z.string().min(6, "Password must be at least 6 characters").max(72),
    confirmPassword: z.string().optional(),
  })
  .refine((d) => !d.confirmPassword || d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  phone: bdPhone,
  password: z.string().min(1, "Password is required"),
});

export const otpRequestSchema = z.object({
  phone: bdPhone.optional(),
  resend: z.coerce.boolean().optional(),
});

export const verifyOtpSchema = z.object({
  phone: bdPhone.optional(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit verification code"),
  mode: z.enum(["signup", "login"]).optional(),
});

export const auctionSchema = z.object({
  title: z.string().trim().min(4, "Title is too short").max(120),
  description: z.string().trim().min(10, "Description is too short").max(5000),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required").max(10),
  startingPrice: z.coerce.number().positive("Starting price must be positive"),
  reservePrice: optionalNumber((n) => n.nonnegative("Reserve cannot be negative")),
  bidIncrement: optionalNumber((n) => n.positive("Bid step must be greater than 0")),
  endDate: z.coerce.date().refine((d) => d.getTime() > Date.now() + 5 * 60000, {
    message: "End date must be at least 5 minutes in the future",
  }),
  condition: z.enum(["new", "used", "refurbished"]).default("used"),
  location: z.string().trim().max(120).optional(),
});

export const bidSchema = z.object({
  amount: z.coerce.number().positive("Bid amount must be positive"),
  maxAutoBid: optionalNumber((n) => n.positive("Auto-bid limit must be greater than 0")),
});

export const messageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().min(1),
  auction: z.string().optional(),
  text: z.string().trim().min(1).max(2000),
});

export const reportSchema = z.object({
  targetType: z.enum(["auction", "user"]),
  targetId: z.string().min(1),
  reason: z.enum(["fraud", "prohibited", "spam", "abuse", "counterfeit", "other"]),
  details: z.string().trim().max(1000).optional(),
});

export const requestSchema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(2000),
  category: z.string().min(1),
  budgetMin: optionalNumber((n) => n.nonnegative()),
  budgetMax: optionalNumber((n) => n.nonnegative()),
});
