import { getCurrentUser } from "@/lib/auth";
import { signToken } from "@/lib/jwt";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * Returns a short-lived token the browser can hand to the Socket.io server
 * (the auth cookie is httpOnly and unreadable from JS). Same signing secret,
 * so the socket server verifies it the same way.
 */
export const GET = handler(async () => {
  const user = await getCurrentUser();
  if (!user) return fail("Not authenticated", 401);
  const token = signToken({ id: String(user._id), role: user.role });
  return ok({ token, userId: String(user._id), name: user.name });
});
