import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireUser } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// PATCH /api/me — update own profile
export const PATCH = handler(async (req) => {
  const me = await requireUser();
  const body = await req.json();
  await connectDB();
  const user = await User.findById(me._id);
  const fields = ["name", "email", "address", "city", "avatar"];
  for (const f of fields) if (body[f] !== undefined) user[f] = body[f];
  await user.save();
  return ok({ user: { ...user.toPublic(), _id: String(user._id) } });
});
