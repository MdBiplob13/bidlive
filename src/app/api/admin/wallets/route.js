import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import User from "@/models/User"; // Registers User model

export const dynamic = "force-dynamic";

// GET /api/admin/wallets — Admin view wallets and transactions
export const GET = handler(async (req) => {
  await requireAdmin();
  await connectDB();

  // Load all wallets with user details
  const wallets = await Wallet.find({})
    .populate("user", "name phone role status")
    .sort({ balance: -1 })
    .lean();

  // Load transactions (showing all, but prioritized by pending or recent)
  const transactions = await Transaction.find({})
    .populate("user", "name phone")
    .sort({ status: 1, createdAt: -1 }) // pending first, then newest
    .limit(100)
    .lean();

  return ok({
    wallets: wallets.map((w) => ({
      ...w,
      _id: String(w._id),
      user: w.user ? { ...w.user, _id: String(w.user._id) } : null,
    })),
    transactions: transactions.map((t) => ({
      ...t,
      _id: String(t._id),
      wallet: String(t.wallet),
      user: t.user ? { ...t.user, _id: String(t.user._id) } : null,
      referenceId: t.referenceId ? String(t.referenceId) : null,
    })),
  });
});
