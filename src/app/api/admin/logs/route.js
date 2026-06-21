import { connectDB } from "@/lib/db";
import AdminLog from "@/models/AdminLog";
import User from "@/models/User"; // registers the User schema so .populate("admin") works
import { requireAdmin } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireAdmin();
  await connectDB();
  const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100).populate("admin", "name").lean();
  return ok({ logs: logs.map((l) => ({ ...l, _id: String(l._id) })) });
});
