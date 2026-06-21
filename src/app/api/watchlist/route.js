import { connectDB } from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import Auction from "@/models/Auction";
import User from "@/models/User"; // registers the User schema so nested .populate("seller") works
import { requireUser } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/watchlist — current user's watched auctions
export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const items = await Watchlist.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate({ path: "auction", populate: { path: "seller", select: "name" } })
    .lean();
  return ok({
    items: items
      .filter((i) => i.auction)
      .map((i) => ({ ...i.auction, _id: String(i.auction._id) })),
  });
});

// POST /api/watchlist { auctionId } — toggle
export const POST = handler(async (req) => {
  const user = await requireUser();
  const { auctionId } = await req.json();
  await connectDB();

  const existing = await Watchlist.findOne({ user: user._id, auction: auctionId });
  if (existing) {
    await existing.deleteOne();
    await Auction.findByIdAndUpdate(auctionId, { $inc: { watchCount: -1 } });
    return ok({ watching: false });
  }
  await Watchlist.create({ user: user._id, auction: auctionId });
  await Auction.findByIdAndUpdate(auctionId, { $inc: { watchCount: 1 } });
  return ok({ watching: true });
});
