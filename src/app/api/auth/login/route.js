import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { ok, fail, handler } from "@/lib/apiResponse";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { generateOtpCode, hashOtpCode } from "@/lib/otp";
import { sendOtpSms } from "@/lib/sms";

export const POST = handler(async (req) => {
  const rl = rateLimit({ key: clientKey(req, "login"), limit: 8, windowMs: 60000 });
  if (!rl.ok) return fail("Too many login attempts. Please wait a moment.", 429);

  const json = await req.json().catch(() => ({}));
  const { phone, password } = loginSchema.parse(json);

  await connectDB();
  const user = await User.findOne({ phone }).select("+password +otpHash +otpExpiresAt +otpAttempts +otpResendCount +lastOtpSentAt +otpLockedUntil");
  if (!user) return fail("Invalid phone number or password", 401);

  const valid = await user.comparePassword(password);
  if (!valid) return fail("Invalid phone number or password", 401);

  if (user.status === "banned") return fail("Your account has been banned", 403);
  if (user.status === "suspended") return fail("Your account is suspended", 403);
  if (user.status === "pending_verification" || !user.isPhoneVerified) {
    user.lastSeen = new Date();
    const otpCode = generateOtpCode();
    const otpHash = await hashOtpCode(otpCode);

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLockedUntil = null;
    user.otpResendCount = 0;
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendOtpSms(user.phone, otpCode);

    return ok({
      user: user.toPublic(),
      requiresVerification: true,
      phone: user.phone,
      mode: "login",
    });
  }

  user.lastSeen = new Date();
  const otpCode = generateOtpCode();
  const otpHash = await hashOtpCode(otpCode);

  user.otpHash = otpHash;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  user.otpAttempts = 0;
  user.otpLockedUntil = null;
  user.otpResendCount = 0;
  user.lastOtpSentAt = new Date();
  await user.save();

  await sendOtpSms(user.phone, otpCode);

  return ok({
    user: user.toPublic(),
    requiresVerification: true,
    phone: user.phone,
    mode: "login",
  });
});
