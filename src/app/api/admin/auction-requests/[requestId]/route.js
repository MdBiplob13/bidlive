import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";
import AuctionRequest from "@/models/AuctionRequest";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import { runInTransaction, releaseBiddingFunds } from "@/lib/wallet/walletService";
import { notify } from "@/lib/notify";

// POST /api/admin/auction-requests/:requestId — Resolve a change or cancellation request
export const POST = handler(async (req, { params }) => {
  const operator = await requirePermission("manage_auctions");
  const { requestId } = await params;
  if (!mongoose.Types.ObjectId.isValid(requestId)) return fail("Request not found", 404);

  const { action, adminNote } = await req.json();
  if (!["approve", "reject"].includes(action)) {
    return fail("Action must be 'approve' or 'reject'", 400);
  }

  await connectDB();

  try {
    const result = await runInTransaction(async (session) => {
      const request = await AuctionRequest.findById(requestId).session(session);
      if (!request) throw new Error("Request not found");
      if (request.status !== "pending") throw new Error("Request has already been processed");

      const auction = await Auction.findById(request.auction).session(session);
      if (!auction) throw new Error("Target auction not found");

      if (action === "approve") {
        if (request.type === "cancel") {
          // Cancel the auction
          auction.status = "cancelled";
          await auction.save({ session });

          // Mark winning and losing bids
          await Bid.updateMany(
            { auction: auction._id, status: "active" },
            { $set: { status: "lost" } }
          ).session(session);

          // If there is an active highest bidder, release their locked bidding funds!
          if (auction.highestBidder) {
            await releaseBiddingFunds(auction.highestBidder, auction._id, session);
          }
        } else if (request.type === "change") {
          // Apply changes
          const editable = [
            "title",
            "description",
            "condition",
            "location",
            "category",
            "startingPrice",
            "reservePrice",
            "endDate",
          ];
          const changes = request.requestedChanges;
          if (changes) {
            for (const [key, value] of changes.entries()) {
              if (editable.includes(key)) {
                if (key === "endDate") {
                  auction.endDate = new Date(value);
                } else {
                  auction[key] = value;
                }
              }
            }
          }
          await auction.save({ session });
        }

        request.status = "approved";
      } else {
        request.status = "rejected";
      }

      request.adminNote = adminNote || "";
      request.resolvedBy = operator._id;
      await request.save({ session });

      return { request, auction };
    });

    // Notify user
    await notify({
      user: result.request.user,
      type: `auction_request_${action}ed`,
      title: {
        en: `Auction ${result.request.type} request ${action}ed`,
        bn: `নিলাম ${result.request.type === "cancel" ? "বাতিল" : "পরিবর্তন"} অনুরোধ ${
          action === "approve" ? "অনুমোদিত" : "প্রত্যাখ্যাত"
        }`,
      },
      body: {
        en: `Your request to ${result.request.type} "${result.auction.title}" was ${action}ed. ${
          adminNote ? `Reason: ${adminNote}` : ""
        }`,
        bn: `আপনার "${result.auction.title}" নিলাম ${
          result.request.type === "cancel" ? "বাতিল" : "পরিবর্তন"
        } করার অনুরোধ ${action === "approve" ? "অনুমোদন" : "প্রত্যাখ্যান"} করা হয়েছে। ${
          adminNote ? `কারণ: ${adminNote}` : ""
        }`,
      },
      link: `/auctions/${result.auction._id}`,
    });

    return ok({
      message: `Auction request has been successfully ${action}ed.`,
      request: {
        ...result.request.toObject(),
        _id: String(result.request._id),
      },
    });
  } catch (error) {
    return fail(error.message, 400);
  }
});
