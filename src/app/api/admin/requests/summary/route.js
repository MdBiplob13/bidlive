import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";
import AuctionRequest from "@/models/AuctionRequest";
import Auction from "@/models/Auction";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requirePermission("manage_auctions");
  await connectDB();

  const [pendingAuctionRequests, pendingKycRequests, pendingWithdrawals, pendingAuctions] = await Promise.all([
    AuctionRequest.countDocuments({ status: "pending" }),
    User.countDocuments({ kycStatus: "pending" }),
    Transaction.countDocuments({ type: "withdrawal", status: "pending" }),
    Auction.countDocuments({ status: "pending" }),
  ]);

  return ok({
    summary: {
      pendingAuctionRequests,
      pendingKycRequests,
      pendingWithdrawals,
      pendingAuctions,
      totalPendingRequests:
        pendingAuctionRequests + pendingKycRequests + pendingWithdrawals + pendingAuctions,
    },
  });
});
