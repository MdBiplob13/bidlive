import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";
import { getOrCreateWallet } from "@/lib/wallet/walletService";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

// GET /api/wallet — Fetch user wallet and transaction ledger
export const GET = handler(async (req) => {
  const user = await requireUser();
  await connectDB();

  const wallet = await getOrCreateWallet(user._id);

  const transactions = await Transaction.find({ wallet: wallet._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return ok({
    wallet: {
      ...wallet.toObject(),
      _id: String(wallet._id),
      user: String(wallet.user),
    },
    transactions: transactions.map((t) => ({
      ...t,
      _id: String(t._id),
      wallet: String(t.wallet),
      user: String(t.user),
      referenceId: t.referenceId ? String(t.referenceId) : null,
    })),
  });
});
