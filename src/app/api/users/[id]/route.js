import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Auction from "@/models/Auction";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/users/:id — public profile (safe subset only)
export const GET = handler(async (req, { params }) => {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return fail("User not found", 404);
  await connectDB();

  const user = await User.findById(id)
    .select("name avatar city isVerified rating ratingCount role createdAt")
    .lean();
  if (!user) return fail("User not found", 404);

  const activeListings = await Auction.countDocuments({ seller: id, status: "active" });

  return ok({ user: { ...user, _id: String(user._id) }, activeListings });
});
