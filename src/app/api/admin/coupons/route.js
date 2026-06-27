import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, created, handler } from "@/lib/apiResponse";
import Coupon from "@/models/Coupon";

const couponSchema = z.object({
  code: z.string().trim().min(2).max(40),
  amount: z.coerce.number().int().positive("Amount must be positive"),
  maxUses: z.coerce.number().int().min(0).optional().default(0),
  expiresAt: z.string().nullable().optional(),
  description: z.string().trim().max(200).optional().default(""),
});

export const GET = handler(async () => {
  await requireAdmin();
  await connectDB();

  const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();

  return ok({
    coupons: coupons.map((coupon) => ({
      ...coupon,
      _id: String(coupon._id),
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString() : null,
    })),
  });
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await req.json();
  const payload = couponSchema.parse(body);
  await connectDB();

  const existing = await Coupon.findOne({ code: payload.code.toUpperCase() });
  if (existing) return fail("Coupon code already exists", 409);

  const coupon = await Coupon.create({
    code: payload.code.toUpperCase(),
    amount: payload.amount,
    maxUses: payload.maxUses,
    expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
    description: payload.description,
    active: true,
  });

  return created({
    message: "Coupon created successfully.",
    coupon: {
      _id: String(coupon._id),
      code: coupon.code,
      amount: coupon.amount,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      description: coupon.description,
      active: coupon.active,
    },
  });
});
