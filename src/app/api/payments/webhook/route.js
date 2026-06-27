import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { PaymentManager } from "@/lib/payments/paymentManager";
import Transaction from "@/models/Transaction";
import Wallet from "@/models/Wallet";

export const dynamic = "force-dynamic";

// GET /api/payments/webhook — Gateway callback landing route
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const txnId = searchParams.get("txnId"); // Internal Transaction ObjectId
  const provider = searchParams.get("provider");
  const amount = searchParams.get("amount");
  const gatewayTxnId = searchParams.get("gatewayTxnId");

  await connectDB();

  try {
    const txn = await Transaction.findById(txnId);
    if (!txn) {
      return redirect("/dashboard/wallet?status=error&message=Transaction+not+found");
    }

    if (txn.status !== "pending") {
      return redirect(`/dashboard/wallet?status=${txn.status}`);
    }

    // Call abstraction to verify payment
    const paymentProvider = PaymentManager.getProvider(provider);
    const verification = await paymentProvider.verifyPayment({
      status,
      amount,
      txnId,
      gatewayTxnId,
    });

    if (verification.success) {
      // Credit wallet balances
      const wallet = await Wallet.findById(txn.wallet);
      wallet.balance += txn.amount;
      wallet.available += txn.amount;
      await wallet.save();

      // Complete transaction ledger entry
      txn.status = "completed";
      txn.balanceAfter = wallet.balance;
      txn.availableAfter = wallet.available;
      txn.lockedAfter = wallet.locked;
      txn.gatewayTxnId = verification.gatewayTxnId;
      txn.description = txn.description.replace("Initiated", "Completed");
      await txn.save();

      return redirect("/dashboard/wallet?status=success");
    } else {
      txn.status = "failed";
      txn.description = txn.description.replace("Initiated", "Failed");
      await txn.save();

      return redirect("/dashboard/wallet?status=fail");
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return redirect(`/dashboard/wallet?status=error&message=${encodeURIComponent(error.message)}`);
  }
}
