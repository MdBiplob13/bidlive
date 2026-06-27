import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";
import { ok, fail, handler } from "@/lib/apiResponse";
import { verifyOtpSchema } from "@/lib/validations";
import { compareOtpCode } from "@/lib/otp";
import { signToken } from "@/lib/jwt";
import { buildAuthCookie } from "@/lib/cookies";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export const POST = handler(async (req) => {
  const rl = rateLimit({ key: clientKey(req, "verify-otp"), limit: 10, windowMs: 60000 });
  if (!rl.ok) return fail("Too many verification attempts. Please wait a moment.", 429);

  const payload = verifyOtpSchema.parse(await req.json().catch(() => ({})));
  const currentUser = await getCurrentUser();
  await connectDB();

  const account = currentUser
    ? await User.findById(currentUser._id).select("+otpHash +otpExpiresAt +otpAttempts +otpResendCount +lastOtpSentAt +otpLockedUntil")
    : await User.findOne({ phone: payload.phone }).select("+otpHash +otpExpiresAt +otpAttempts +otpResendCount +lastOtpSentAt +otpLockedUntil");

  if (!account) return fail("User not found", 404);

  const now = Date.now();
  if (account.otpLockedUntil && new Date(account.otpLockedUntil).getTime() > now) {
    return fail("Verification is temporarily locked. Please try again later.", 429);
  }
  if (!account.otpHash || !account.otpExpiresAt) {
    return fail("No verification code is active. Please request a new one.", 400);
  }
  if (new Date(account.otpExpiresAt).getTime() < now) {
    account.otpHash = "";
    account.otpExpiresAt = null;
    account.otpAttempts = 0;
    account.otpLockedUntil = null;
    await account.save();
    return fail("The verification code has expired. Please request a new one.", 400);
  }

  const isMatch = await compareOtpCode(payload.code, account.otpHash);
  if (!isMatch) {
    const nextAttempts = (account.otpAttempts || 0) + 1;
    account.otpAttempts = nextAttempts;
    if (nextAttempts >= 5) {
      account.otpLockedUntil = new Date(now + 10 * 60 * 1000);
    }
    await account.save();
    return fail("The verification code is incorrect", 401);
  }

  account.isPhoneVerified = true;
  account.isVerified = true;
  account.status = "active";
  account.otpHash = "";
  account.otpExpiresAt = null;
  account.otpAttempts = 0;
  account.otpLockedUntil = null;
  account.otpResendCount = 0;
  account.lastOtpSentAt = null;
  await account.save();

  const token = signToken({ id: String(account._id), role: account.role });
  const cookie = buildAuthCookie(token);
  (await cookies()).set(cookie.name, cookie.value, cookie.options);

  return ok({ user: account.toPublic(), verified: true });
});
