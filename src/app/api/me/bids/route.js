import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Bid from "@/models/Bid";
import { requireUser } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/me/bids — auctions the user has bid on (latest bid per auction)
export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();

  // Aggregation does NOT auto-cast strings to ObjectId (unlike find), so cast.
  const bidderId = new mongoose.Types.ObjectId(String(user._id));

  const bids = await Bid.aggregate([
    { $match: { bidder: bidderId } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$auction",
        myMax: { $max: "$amount" },
        lastBidAt: { $first: "$createdAt" },
        status: { $first: "$status" },
      },
    },
    { $sort: { lastBidAt: -1 } },
    { $limit: 50 },
    {
      $lookup: { from: "auctions", localField: "_id", foreignField: "_id", as: "auction" },
    },
    { $unwind: "$auction" },
  ]);

  const items = bids.map((b) => ({
    auction: {
      _id: String(b.auction._id),
      title: b.auction.title,
      images: b.auction.images,
      currentBid: b.auction.currentBid,
      startingPrice: b.auction.startingPrice,
      endDate: b.auction.endDate,
      status: b.auction.status,
      highestBidder: String(b.auction.highestBidder || ""),
    },
    myMax: b.myMax,
    leading: String(b.auction.highestBidder || "") === String(user._id),
    bidCount: b.auction.bidCount,
  }));

  return ok({ items });
});
