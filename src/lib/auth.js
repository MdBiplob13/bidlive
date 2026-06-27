import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { COOKIE_NAME } from "@/lib/cookies";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * Read the JWT payload from the auth cookie. Returns null when unauthenticated.
 * Works inside Next.js Route Handlers / Server Components.
 */
export async function getTokenPayload() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Load the full user document for the current request (without password).
 * Returns null when not logged in or user no longer exists / is banned.
 */
export async function getCurrentUser() {
  const payload = await getTokenPayload();
  if (!payload?.id) return null;
  await connectDB();
  const user = await User.findById(payload.id).select("-password").lean();
  if (!user) return null;
  return { ...user, _id: String(user._id) };
}

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

/** Throw if not authenticated. Returns the user. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Authentication required", 401);
  if (user.status === "banned") throw new AuthError("Account is banned", 403);
  if (user.status === "suspended") throw new AuthError("Account is suspended", 403);
  if (user.status === "pending_verification" || !user.isPhoneVerified) {
    throw new AuthError("Please verify your phone number before continuing", 403);
  }
  return user;
}

/** Throw if not an admin. Returns the admin user. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError("Admin access required", 403);
  return user;
}

/** Throw if the user doesn't have the required permission. Admins automatically pass. */
export async function requirePermission(permission) {
  const user = await requireUser();
  if (user.role === "admin") return user;
  if (user.role === "employee" && user.permissions?.includes(permission)) {
    return user;
  }
  throw new AuthError(`Access denied: Requires permission '${permission}'`, 403);
}
