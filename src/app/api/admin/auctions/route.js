import { connectDB } from "@/lib/db";
import Auction from "@/models/Auction";
import User from "@/models/User"; // registers schemas referenced by .populate()
import Category from "@/models/Category";
import { requirePermission } from "@/lib/auth";
import { logAdmin } from "@/lib/adminLog";
import { notify } from "@/lib/notify";
import { settleAuction } from "@/lib/auctionEngine";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/admin/auctions?status=&page= — Operator gets auctions
export const GET = handler(async (req) => {
  await requirePermission("manage_auctions");
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = 20;
  const status = sp.get("status");
  const filter = {};
  if (status && status !== "all") filter.status = status;

  const [auctions, total] = await Promise.all([
    Auction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("seller", "name phone")
      .populate("category", "name slug")
      .lean(),
    Auction.countDocuments(filter),
  ]);
  return ok({
    auctions: auctions.map((a) => ({ ...a, _id: String(a._id) })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// PATCH /api/admin/auctions  { auctionId, action, reason, updateFields? }
export const PATCH = handler(async (req) => {
  const operator = await requirePermission("manage_auctions");
  const { auctionId, action, reason, updateFields } = await req.json();
  await connectDB();
  const auction = await Auction.findById(auctionId);
  if (!auction) return fail("Auction not found", 404);

  // Apply edits if passed in payload (allowed for pending, restricted for active)
  if (updateFields) {
    if (auction.status !== "pending") {
      // Check if commission is being modified after approval
      if (
        updateFields.commissionRate !== undefined &&
        Number(updateFields.commissionRate) !== Number(auction.commissionRate)
      ) {
        return fail("Commission rate cannot be modified once the auction is approved.", 400);
      }
    }
    const editable = [
      "title",
      "description",
      "startingPrice",
      "reservePrice",
      "bidIncrement",
      "commissionRate",
      "endDate",
      "condition",
      "location",
      "category",
    ];
    for (const f of editable) {
      if (updateFields[f] !== undefined) {
        if (f === "category") {
          auction.category = updateFields.category;
        } else if (f === "endDate") {
          auction.endDate = new Date(updateFields.endDate);
        } else {
          auction[f] = updateFields[f];
        }
      }
    }
    // Also support updating images if provided
    if (updateFields.images) {
      auction.images = updateFields.images.map((url) => ({ url, publicId: "" }));
    }
    await auction.save();
  }

  // Handle status action transitions
  if (action) {
    switch (action) {
      case "approve":
        auction.status = "active";
        if (auction.startDate > new Date()) auction.startDate = new Date();
        await auction.save();
        await notify({
          user: auction.seller,
          type: "auction_approved",
          title: { en: "Auction approved", bn: "নিলাম অনুমোদিত" },
          body: { en: `"${auction.title}" is now live.`, bn: `"${auction.title}" এখন লাইভ।` },
          link: `/auctions/${auction._id}`,
        });
        break;
      case "reject":
        auction.status = "rejected";
        auction.rejectionReason = reason || "";
        await auction.save();
        await notify({
          user: auction.seller,
          type: "auction_rejected",
          title: { en: "Auction rejected", bn: "নিলাম প্রত্যাখ্যাত" },
          body: {
            en: reason || "Your auction was rejected.",
            bn: reason || "আপনার নিলাম প্রত্যাখ্যান করা হয়েছে।",
          },
          link: `/auctions/${auction._id}`,
        });
        break;
      case "feature":
        auction.isFeatured = !auction.isFeatured;
        await auction.save();
        break;
      case "forceClose":
        auction.endDate = new Date();
        await auction.save();
        await settleAuction(auction._id);
        break;
      default:
        // If they just wanted to update fields and no status transition
        if (action === "edit") break;
        return fail("Unknown action", 400);
    }
    await logAdmin({
      admin: operator._id,
      action: `auction.${action}`,
      targetType: "auction",
      targetId: auctionId,
      note: reason || "Modified by operator",
    });
  }

  const fresh = await Auction.findById(auctionId)
    .populate("seller", "name phone")
    .populate("category", "name slug")
    .lean();
  return ok({ auction: { ...fresh, _id: String(fresh._id) } });
});
