import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Auction from "@/models/Auction";
import Bid from "@/models/Bid";
import Order from "@/models/Order";
import Report from "@/models/Report";
import { requireAdmin } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireAdmin();
  await connectDB();

  const [users, auctions, bids, orders, pendingAuctions, openReports, activeAuctions, soldAuctions, revenueAgg] =
    await Promise.all([
      User.countDocuments(),
      Auction.countDocuments(),
      Bid.countDocuments(),
      Order.countDocuments(),
      Auction.countDocuments({ status: "pending" }),
      Report.countDocuments({ status: "open" }),
      Auction.countDocuments({ status: "active" }),
      Auction.countDocuments({ status: "sold" }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

  return ok({
    stats: {
      users,
      auctions,
      bids,
      orders,
      pendingAuctions,
      openReports,
      activeAuctions,
      soldAuctions,
      gmv: revenueAgg[0]?.total || 0,
    },
  });
});
