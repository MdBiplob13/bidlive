import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import Coupon from "@/models/Coupon";
import Transaction from "@/models/Transaction";
import { getOrCreateWallet } from "@/lib/wallet/walletService";

const redeemSchema = z.object({
  code: z.string().trim().min(2, "Coupon code is required"),
});

export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  const { code } = redeemSchema.parse(body);
  await connectDB();

  const coupon = await Coupon.findOne({ code: code.toUpperCase() }).lean();
  if (!coupon) return fail("Coupon code is invalid", 404);

  if (!coupon.active) return fail("This coupon is no longer active", 400);

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return fail("This coupon has expired", 400);
  }

  if (coupon.maxUses > 0 && coupon.usedBy?.length >= coupon.maxUses) {
    return fail("This coupon has reached its maximum usage", 400);
  }

  if (coupon.usedBy?.some((id) => String(id) === String(user._id))) {
    return fail("You have already used this coupon", 400);
  }

  const wallet = await getOrCreateWallet(user._id);
  wallet.balance += coupon.amount;
  wallet.available += coupon.amount;
  await wallet.save();

  await Coupon.updateOne({ _id: coupon._id }, { $addToSet: { usedBy: user._id } });

  await Transaction.create({
    wallet: wallet._id,
    user: user._id,
    type: "adjustment_credit",
    amount: coupon.amount,
    balanceAfter: wallet.balance,
    availableAfter: wallet.available,
    lockedAfter: wallet.locked,
    status: "completed",
    description: `Redeemed coupon ${coupon.code} for ৳${coupon.amount}.`,
  });

  return ok({
    message: `Coupon redeemed successfully. ৳${coupon.amount} added to your wallet.`,
    amount: coupon.amount,
  });
});
