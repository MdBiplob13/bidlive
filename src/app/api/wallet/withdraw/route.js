import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import { requestWithdrawal } from "@/lib/wallet/walletService";

const withdrawSchema = z.object({
  amount: z.coerce.number().positive("Withdrawal amount must be positive"),
  method: z.enum(["bkash", "nagad", "bank"]),
  accountDetails: z.string().trim().min(4, "Account number/details are too short"),
});

// POST /api/wallet/withdraw — Request a withdrawal
export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  const { amount, method, accountDetails } = withdrawSchema.parse(body);

  await connectDB();

  try {
    const txn = await requestWithdrawal(user._id, amount, method, accountDetails);
    return ok({
      message: "Withdrawal request submitted. The requested amount has been locked and is pending admin approval.",
      transactionId: String(txn._id),
    });
  } catch (error) {
    return fail(error.message, 400);
  }
});
