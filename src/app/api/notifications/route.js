import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";
import { requireUser } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/notifications
export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const [items, unread] = await Promise.all([
    Notification.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ user: user._id, isRead: false }),
  ]);
  return ok({ items: items.map((n) => ({ ...n, _id: String(n._id) })), unread });
});

// PATCH /api/notifications  { id? }  — mark one (or all) read
export const PATCH = handler(async (req) => {
  const user = await requireUser();
  const { id } = await req.json().catch(() => ({}));
  await connectDB();
  if (id) await Notification.updateOne({ _id: id, user: user._id }, { isRead: true });
  else await Notification.updateMany({ user: user._id, isRead: false }, { isRead: true });
  return ok({ updated: true });
});
