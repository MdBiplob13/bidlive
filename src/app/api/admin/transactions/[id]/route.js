import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import Transaction from "@/models/Transaction";
import {
  approveManualDeposit,
  rejectManualDeposit,
  approveWithdrawal,
  rejectWithdrawal,
} from "@/lib/wallet/walletService";

// POST /api/admin/transactions/:id — Approve/Reject a pending request
export const POST = handler(async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Transaction not found", 404);

  const { action } = await req.json();
  if (!["approve", "reject"].includes(action)) {
    return fail("Action must be 'approve' or 'reject'", 400);
  }

  await connectDB();

  const txn = await Transaction.findById(id);
  if (!txn) return fail("Transaction not found", 404);
  if (txn.status !== "pending") return fail("This transaction is already processed", 400);

  try {
    let result;
    if (txn.type === "deposit") {
      if (action === "approve") {
        result = await approveManualDeposit(txn._id);
      } else {
        result = await rejectManualDeposit(txn._id);
      }
    } else if (txn.type === "withdrawal") {
      if (action === "approve") {
        result = await approveWithdrawal(txn._id);
      } else {
        result = await rejectWithdrawal(txn._id);
      }
    } else {
      return fail("This type of transaction does not support manual approval/rejection", 400);
    }

    return ok({
      message: `Transaction has been successfully ${action}d.`,
      transaction: {
        ...result.toObject(),
        _id: String(result._id),
      },
    });
  } catch (error) {
    return fail(error.message, 400);
  }
});
