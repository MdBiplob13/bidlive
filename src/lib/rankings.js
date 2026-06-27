import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

const PERIOD_TYPES = ["weekly", "monthly", "yearly"];

export function normalizePeriodType(periodType) {
  if (!periodType || typeof periodType !== "string") return "weekly";
  const lower = periodType.toLowerCase();
  return PERIOD_TYPES.includes(lower) ? lower : "weekly";
}

export function getPeriodRange(periodType) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  let periodKey = "";
  let periodLabel = "";
  let end = new Date(start);

  if (periodType === "monthly") {
    start.setDate(1);
    periodKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`;
    periodLabel = `${start.toLocaleString("default", { month: "long" })} ${start.getFullYear()}`;
    end.setMonth(start.getMonth() + 1);
  } else if (periodType === "yearly") {
    start.setMonth(0, 1);
    periodKey = `${start.getFullYear()}`;
    periodLabel = `${start.getFullYear()}`;
    end.setFullYear(start.getFullYear() + 1);
  } else {
    const day = start.getDay();
    const diff = (day + 6) % 7;
    start.setDate(start.getDate() - diff);
    periodKey = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    periodLabel = `Week of ${periodKey}`;
    end.setDate(start.getDate() + 7);
  }

  return { start, end, periodKey, periodLabel };
}

export async function calculateRankingItems(periodType) {
  await connectDB();
  const { start, end } = getPeriodRange(periodType);

  const rankings = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lt: end },
        status: { $ne: "cancelled" },
      },
    },
    {
      $project: {
        _id: "$buyer",
        auctionSpend: "$amount",
        walletSpend: 0,
      },
    },
    {
      $group: {
        _id: "$_id",
        auctionSpend: { $sum: "$auctionSpend" },
        walletSpend: { $sum: "$walletSpend" },
      },
    },
    {
      $unionWith: {
        coll: "transactions",
        pipeline: [
          {
            $match: {
              createdAt: { $gte: start, $lt: end },
              status: "completed",
              type: { $in: ["payment_deduction", "withdrawal", "adjustment_debit"] },
            },
          },
          {
            $project: {
              _id: "$user",
              auctionSpend: 0,
              walletSpend: { $abs: "$amount" },
            },
          },
          {
            $group: {
              _id: "$_id",
              auctionSpend: { $sum: "$auctionSpend" },
              walletSpend: { $sum: "$walletSpend" },
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$_id",
        auctionSpend: { $sum: "$auctionSpend" },
        walletSpend: { $sum: "$walletSpend" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: { $toString: "$_id" },
        userName: "$user.name",
        auctionSpend: 1,
        walletSpend: 1,
      },
    },
    {
      $addFields: {
        totalSpend: { $add: ["$auctionSpend", "$walletSpend"] },
      },
    },
    {
      $sort: { totalSpend: -1, auctionSpend: -1, userName: 1 },
    },
  ]);

  return rankings.map((item, index) => ({
    _id: item._id,
    user: item._id,
    name: item.userName || "User",
    auctionSpend: item.auctionSpend || 0,
    walletSpend: item.walletSpend || 0,
    points: item.totalSpend || 0,
    totalSpend: item.totalSpend || 0,
    rank: index + 1,
  }));
}
