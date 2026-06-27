import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";
import AuctionRequest from "@/models/AuctionRequest";
import User from "@/models/User"; // Registers user schema
import Auction from "@/models/Auction"; // Registers auction schema
import { normalizeRequestedChanges } from "@/lib/auctionRequests";

export const dynamic = "force-dynamic";

// GET /api/admin/auction-requests — List modification requests (Operator only)
export const GET = handler(async (req) => {
  await requirePermission("manage_auctions");
  await connectDB();

  const requests = await AuctionRequest.find({ status: "pending" })
    .populate("user", "name phone")
    .populate("auction", "title status seller highestBidder currentBid")
    .sort({ createdAt: -1 })
    .lean();

  return ok({
    requests: requests.map((r) => ({
      ...r,
      _id: String(r._id),
      user: r.user ? { ...r.user, _id: String(r.user._id) } : null,
      auction: r.auction ? { ...r.auction, _id: String(r.auction._id) } : null,
      resolvedBy: r.resolvedBy ? String(r.resolvedBy) : null,
      requestedChanges: normalizeRequestedChanges(r.requestedChanges),
    })),
  });
});
