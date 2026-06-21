import { connectDB } from "@/lib/db";
import Auction from "@/models/Auction";
import User from "@/models/User"; // registers schemas referenced by .populate()
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { logAdmin } from "@/lib/adminLog";
import { notify } from "@/lib/notify";
import { settleAuction } from "@/lib/auctionEngine";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/admin/auctions?status=&page=
export const GET = handler(async (req) => {
  await requireAdmin();
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = 20;
  const status = sp.get("status");
  const filter = {};
  if (status && status !== "all") filter.status = status;

  const [auctions, total] = await Promise.all([
    Auction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate("seller", "name phone").populate("category", "name slug").lean(),
    Auction.countDocuments(filter),
  ]);
  return ok({ auctions: auctions.map((a) => ({ ...a, _id: String(a._id) })), total, page, pages: Math.ceil(total / limit) });
});

// PATCH /api/admin/auctions  { auctionId, action: approve|reject|forceClose|feature, reason? }
export const PATCH = handler(async (req) => {
  const admin = await requireAdmin();
  const { auctionId, action, reason } = await req.json();
  await connectDB();
  const auction = await Auction.findById(auctionId);
  if (!auction) return fail("Auction not found", 404);

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
        body: { en: reason || "Your auction was rejected.", bn: reason || "আপনার নিলাম প্রত্যাখ্যান করা হয়েছে।" },
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
      return fail("Unknown action", 400);
  }

  await logAdmin({ admin: admin._id, action: `auction.${action}`, targetType: "auction", targetId: auctionId, note: reason });
  const fresh = await Auction.findById(auctionId).lean();
  return ok({ auction: { ...fresh, _id: String(fresh._id) } });
});
