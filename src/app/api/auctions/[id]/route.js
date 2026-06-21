import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import User from "@/models/User"; // registers schemas referenced by .populate()
import Category from "@/models/Category";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import { settleAuction } from "@/lib/auctionEngine";

export const dynamic = "force-dynamic";

function validId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/auctions/:id — detail + recent bids
export const GET = handler(async (req, { params }) => {
  const { id } = await params;
  if (!validId(id)) return fail("Auction not found", 404);
  await connectDB();

  // Settle if its time is up so the detail page shows the final state.
  await settleAuction(id).catch(() => {});

  const auction = await Auction.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("category", "slug name")
    .populate("seller", "name avatar isVerified rating ratingCount city")
    .populate("highestBidder", "name avatar")
    .populate("winner", "name avatar")
    .lean();

  if (!auction) return fail("Auction not found", 404);

  const bids = await Bid.find({ auction: id })
    .sort({ amount: -1, createdAt: -1 })
    .limit(15)
    .populate("bidder", "name avatar")
    .lean();

  return ok({
    auction: { ...auction, _id: String(auction._id) },
    bids: bids.map((b) => ({ ...b, _id: String(b._id) })),
  });
});

// PATCH /api/auctions/:id — seller edits (only while pending) or cancels
export const PATCH = handler(async (req, { params }) => {
  const { id } = await params;
  const user = await requireUser();
  if (!validId(id)) return fail("Auction not found", 404);
  await connectDB();

  const auction = await Auction.findById(id);
  if (!auction) return fail("Auction not found", 404);
  if (String(auction.seller) !== String(user._id))
    return fail("You can only edit your own auctions", 403);

  const body = await req.json();

  if (body.action === "cancel") {
    if (auction.bidCount > 0) return fail("Cannot cancel an auction with bids", 400);
    auction.status = "cancelled";
    await auction.save();
    return ok({ auction: { ...auction.toObject(), _id: String(auction._id) } });
  }

  if (auction.status !== "pending")
    return fail("Only pending auctions can be edited", 400);

  const editable = ["title", "description", "startingPrice", "reservePrice", "endDate", "condition", "location"];
  for (const f of editable) if (body[f] !== undefined) auction[f] = body[f];
  await auction.save();

  return ok({ auction: { ...auction.toObject(), _id: String(auction._id) } });
});

// DELETE /api/auctions/:id — seller removes a pending/rejected auction
export const DELETE = handler(async (req, { params }) => {
  const { id } = await params;
  const user = await requireUser();
  if (!validId(id)) return fail("Auction not found", 404);
  await connectDB();

  const auction = await Auction.findById(id);
  if (!auction) return fail("Auction not found", 404);
  if (String(auction.seller) !== String(user._id) && user.role !== "admin")
    return fail("Not allowed", 403);
  if (["active", "sold"].includes(auction.status) || auction.bidCount > 0)
    return fail("Cannot delete an active or sold auction", 400);

  await auction.deleteOne();
  return ok({ deleted: true });
});
