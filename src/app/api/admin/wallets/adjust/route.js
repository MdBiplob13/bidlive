import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import { adminAdjustment } from "@/lib/wallet/walletService";

const adjustSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["adjustment_credit", "adjustment_debit"]),
  description: z.string().trim().min(5, "Adjustment description is too short"),
});

// POST /api/admin/wallets/adjust — Direct admin balance modifications
export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await req.json();
  const { userId, amount, type, description } = adjustSchema.parse(body);

  await connectDB();

  try {
    const txn = await adminAdjustment(userId, amount, type, description);
    return ok({
      message: `Wallet adjustment of ৳${amount} has been successfully completed.`,
      transactionId: String(txn._id),
    });
  } catch (error) {
    return fail(error.message, 400);
  }
});
