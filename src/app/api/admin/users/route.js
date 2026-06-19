import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import { logAdmin } from "@/lib/adminLog";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/admin/users?q=&page=&status=
export const GET = handler(async (req) => {
  await requireAdmin();
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = 20;
  const q = sp.get("q")?.trim();
  const status = sp.get("status");

  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (q) filter.$or = [{ name: new RegExp(q, "i") }, { phone: new RegExp(q, "i") }];

  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return ok({ users: users.map((u) => ({ ...u, _id: String(u._id) })), total, page, pages: Math.ceil(total / limit) });
});

// PATCH /api/admin/users  { userId, action: ban|suspend|activate|delete|makeAdmin, reason? }
export const PATCH = handler(async (req) => {
  const admin = await requireAdmin();
  const { userId, action, reason } = await req.json();
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return fail("User not found", 404);
  if (String(user._id) === String(admin._id)) return fail("You cannot modify your own account here", 400);

  switch (action) {
    case "ban":
      user.status = "banned";
      user.banReason = reason || "";
      break;
    case "suspend":
      user.status = "suspended";
      user.suspendedUntil = new Date(Date.now() + 7 * 86400000);
      break;
    case "activate":
      user.status = "active";
      user.banReason = "";
      user.suspendedUntil = null;
      break;
    case "makeAdmin":
      user.role = "admin";
      break;
    case "delete":
      await user.deleteOne();
      await logAdmin({ admin: admin._id, action: "user.delete", targetType: "user", targetId: userId, note: reason });
      return ok({ deleted: true });
    default:
      return fail("Unknown action", 400);
  }
  await user.save();
  await logAdmin({ admin: admin._id, action: `user.${action}`, targetType: "user", targetId: userId, note: reason });
  return ok({ user: { ...user.toPublic(), _id: String(user._id) } });
});
