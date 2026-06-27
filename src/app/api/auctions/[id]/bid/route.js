import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Bid from "@/models/Bid";
import User from "@/models/User"; // registers the User schema so .populate("bidder") works
import { requireUser } from "@/lib/auth";
import { bidSchema } from "@/lib/validations";
import { ok, fail, handler } from "@/lib/apiResponse";
import { placeBid } from "@/lib/auctionEngine";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// POST /api/auctions/:id/bid  { amount, maxAutoBid? }
export const POST = handler(async (req, { params }) => {
  const { id } = await params;
  const user = await requireUser();
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Auction not found", 404);

  const rl = rateLimit({ key: clientKey(req, `bid:${user._id}`), limit: 20, windowMs: 60000 });
  if (!rl.ok) return fail("You're bidding too fast. Please slow down.", 429);

  const { amount, maxAutoBid } = bidSchema.parse(await req.json());
  await connectDB();

  if (!user.isVerified) {
    return fail("Phone verification is required before placing bids.", 403);
  }
  if (user.kycStatus !== "approved") {
    return fail("KYC approval is required before placing bids.", 403);
  }

  try {
    const { auction, leaderChanged } = await placeBid({
      auctionId: id,
      bidderId: user._id,
      amount,
      maxAutoBid,
    });
    return ok({
      currentBid: auction.currentBid,
      bidCount: auction.bidCount,
      youAreLeading: String(auction.highestBidder) === String(user._id),
      leaderChanged,
    });
  } catch (e) {
    return fail(e.message || "Could not place bid", e.status || 400);
  }
});

// GET /api/auctions/:id/bid — bid history
export const GET = handler(async (req, { params }) => {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Auction not found", 404);
  await connectDB();
  const bids = await Bid.find({ auction: id })
    .sort({ amount: -1, createdAt: -1 })
    .limit(50)
    .populate("bidder", "name avatar")
    .lean();
  return ok({ bids: bids.map((b) => ({ ...b, _id: String(b._id) })) });
});
