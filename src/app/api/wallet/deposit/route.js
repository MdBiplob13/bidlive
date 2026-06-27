import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import { getOrCreateWallet } from "@/lib/wallet/walletService";
import Transaction from "@/models/Transaction";

const depositSchema = z.object({
  amount: z.coerce.number().positive("Deposit amount must be positive"),
  provider: z.enum(["sslcommerz", "card", "manual"]),
  method: z.string().optional(),       // e.g. bkash, nagad
  gatewayTxnId: z.string().optional(), // manual transaction reference ID
});

// POST /api/wallet/deposit — Top up wallet balance instantly (Demo/One-click mode)
export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  const { amount, provider, method, gatewayTxnId } = depositSchema.parse(body);

  await connectDB();

  try {
    // One-click instant deposit in demo mode!
    const wallet = await getOrCreateWallet(user._id);
    wallet.balance += amount;
    wallet.available += amount;
    await wallet.save();

    const gatewayName = provider === "manual" ? `demo_${method || "manual"}` : provider;
    const realTxnId = gatewayTxnId || `DEMO-TXN-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const txn = await Transaction.create([
      {
        wallet: wallet._id,
        user: user._id,
        type: "deposit",
        amount,
        balanceAfter: wallet.balance,
        availableAfter: wallet.available,
        lockedAfter: wallet.locked,
        status: "completed",
        paymentGateway: gatewayName,
        gatewayTxnId: realTxnId,
        description: `Instant demo deposit of ৳${amount} via ${gatewayName}.`,
      }
    ]);

    return ok({
      message: `৳${amount} has been successfully deposited into your wallet instantly (Demo Mode).`,
      transactionId: String(txn[0]._id),
      gatewayTxnId: realTxnId,
    });
  } catch (error) {
    return fail(error.message, 400);
  }
});
