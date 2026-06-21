import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User"; // registers schemas referenced by .populate()
import Auction from "@/models/Auction";
import { requireUser } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/orders?role=buyer|seller
export const GET = handler(async (req) => {
  const user = await requireUser();
  await connectDB();
  const role = req.nextUrl.searchParams.get("role") || "buyer";
  const filter = role === "seller" ? { seller: user._id } : { buyer: user._id };
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .populate("auction", "title images")
    .populate("buyer", "name phone")
    .populate("seller", "name phone")
    .lean();
  return ok({ orders: orders.map((o) => ({ ...o, _id: String(o._id) })) });
});
