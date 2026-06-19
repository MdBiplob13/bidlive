import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { signToken } from "@/lib/jwt";
import { buildAuthCookie } from "@/lib/cookies";
import { created, fail, handler } from "@/lib/apiResponse";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const POST = handler(async (req) => {
  const rl = rateLimit({ key: clientKey(req, "register"), limit: 5, windowMs: 60000 });
  if (!rl.ok) return fail("Too many attempts. Please wait a moment.", 429);

  const json = await req.json();
  const { name, phone, password } = registerSchema.parse(json);

  await connectDB();
  const exists = await User.findOne({ phone });
  if (exists) return fail("This phone number is already registered", 409);

  const user = await User.create({ name, phone, password });
  const token = signToken({ id: String(user._id), role: user.role });

  const c = buildAuthCookie(token);
  (await cookies()).set(c.name, c.value, c.options);

  return created({ user: user.toPublic() });
});
