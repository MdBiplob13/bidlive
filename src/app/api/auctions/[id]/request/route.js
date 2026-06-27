import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import Auction from "@/models/Auction";
import AuctionRequest from "@/models/AuctionRequest";

const requestSchema = z.object({
  type: z.enum(["change", "cancel"]),
  reason: z.string().trim().min(5, "Reason is too short"),
  requestedChanges: z.record(z.any()).optional(), // only for 'change'
});

// POST /api/auctions/:id/request — Submit a change or cancellation request
export const POST = handler(async (req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("Auction not found", 404);

  const body = await req.json();
  const { type, reason, requestedChanges } = requestSchema.parse(body);

  await connectDB();

  const auction = await Auction.findById(id);
  if (!auction) return fail("Auction not found", 404);
  if (String(auction.seller) !== String(user._id)) {
    return fail("You are not the seller of this auction.", 403);
  }

  if (auction.status !== "active") {
    return fail("Requests can only be submitted for active, approved auctions.", 400);
  }

  // Check if there is already a pending request for this auction
  const existingPending = await AuctionRequest.findOne({
    auction: auction._id,
    status: "pending",
  });
  if (existingPending) {
    return fail("There is already a pending change or cancellation request for this auction.", 400);
  }

  try {
    const request = await AuctionRequest.create({
      user: user._id,
      auction: auction._id,
      type,
      reason,
      requestedChanges: type === "change" ? requestedChanges : undefined,
      status: "pending",
    });

    return ok({
      message: "Your request has been successfully submitted and is pending administrator review.",
      request: {
        _id: String(request._id),
        type: request.type,
        status: request.status,
      },
    });
  } catch (error) {
    return fail(error.message, 400);
  }
});
