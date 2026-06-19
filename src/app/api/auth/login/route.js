import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { signToken } from "@/lib/jwt";
import { buildAuthCookie } from "@/lib/cookies";
import { ok, fail, handler } from "@/lib/apiResponse";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const POST = handler(async (req) => {
  const rl = rateLimit({ key: clientKey(req, "login"), limit: 8, windowMs: 60000 });
  if (!rl.ok) return fail("Too many login attempts. Please wait a moment.", 429);

  const json = await req.json();
  const { phone, password } = loginSchema.parse(json);

  await connectDB();
  const user = await User.findOne({ phone }).select("+password");
  if (!user) return fail("Invalid phone number or password", 401);

  const valid = await user.comparePassword(password);
  if (!valid) return fail("Invalid phone number or password", 401);

  if (user.status === "banned") return fail("Your account has been banned", 403);
  if (user.status === "suspended") return fail("Your account is suspended", 403);

  user.lastSeen = new Date();
  await user.save();

  const token = signToken({ id: String(user._id), role: user.role });
  const c = buildAuthCookie(token);
  (await cookies()).set(c.name, c.value, c.options);

  return ok({ user: user.toPublic() });
});
