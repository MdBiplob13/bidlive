import { connectDB } from "@/lib/db";
import Bid from "@/models/Bid";
import Auction from "@/models/Auction";
import { requireAdmin } from "@/lib/auth";
import { logAdmin } from "@/lib/adminLog";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/admin/bids?status=&type=&page=
export const GET = handler(async (req) => {
  await requireAdmin();
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = 24;
  const status = sp.get("status");
  const type = sp.get("type");

  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (type && type !== "all") filter.type = type;

  const [bids, total] = await Promise.all([
    Bid.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("bidder", "name avatar phone")
      .populate({ path: "auction", select: "title images status currentBid endDate" })
      .lean(),
    Bid.countDocuments(filter),
  ]);

  return ok({
    bids: bids.map((b) => ({
      ...b,
      _id: String(b._id),
      auction: b.auction ? { ...b.auction, _id: String(b.auction._id) } : null,
      bidder: b.bidder ? { ...b.bidder, _id: String(b.bidder._id) } : null,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// DELETE /api/admin/bids  { bidId } — remove a bid (recomputes auction state)
export const DELETE = handler(async (req) => {
  const admin = await requireAdmin();
  const { bidId } = await req.json();
  await connectDB();

  const bid = await Bid.findById(bidId);
  if (!bid) return fail("Bid not found", 404);
  const auctionId = bid.auction;
  await bid.deleteOne();

  // Recompute the auction's current bid / highest bidder from remaining bids.
  if (auctionId) {
    const top = await Bid.findOne({ auction: auctionId }).sort({ amount: -1, createdAt: -1 }).lean();
    const count = await Bid.countDocuments({ auction: auctionId });
    const auction = await Auction.findById(auctionId);
    if (auction) {
      auction.bidCount = count;
      auction.currentBid = top ? top.amount : 0;
      auction.highestBidder = top ? top.bidder : null;
      if (auction.reservePrice > 0) auction.reserveMet = auction.currentBid >= auction.reservePrice;
      await auction.save();
    }
  }

  await logAdmin({ admin: admin._id, action: "bid.delete", targetType: "bid", targetId: bidId });
  return ok({ deleted: true });
});
