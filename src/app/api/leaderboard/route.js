import { connectDB } from "@/lib/db";
import Bid from "@/models/Bid";
import User from "@/models/User";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await connectDB();

  const rankings = await Bid.aggregate([
    { $match: { status: { $in: ["active", "won"] } } },
    {
      $group: {
        _id: "$bidder",
        totalBids: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    { $sort: { totalAmount: -1, totalBids: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    { $project: { _id: { $toString: "$_id" }, name: "$user.name", totalBids: 1, totalAmount: 1 } },
  ]);

  const items = rankings.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  return ok({ items });
});
