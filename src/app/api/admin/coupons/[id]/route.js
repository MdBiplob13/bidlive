import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import Coupon from "@/models/Coupon";

export const PATCH = handler(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  await connectDB();

  const coupon = await Coupon.findById(id);
  if (!coupon) return fail("Coupon not found", 404);

  if (typeof body.active === "boolean") coupon.active = body.active;
  await coupon.save();

  return ok({
    message: "Coupon updated.",
    coupon: {
      _id: String(coupon._id),
      code: coupon.code,
      amount: coupon.amount,
      active: coupon.active,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      maxUses: coupon.maxUses,
      usedBy: coupon.usedBy?.length || 0,
      description: coupon.description,
    },
  });
});

export const DELETE = handler(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  await connectDB();

  const deleted = await Coupon.findByIdAndDelete(id);
  if (!deleted) return fail("Coupon not found", 404);

  return ok({ message: "Coupon deleted." });
});
