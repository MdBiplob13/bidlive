import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { created, fail, handler } from "@/lib/apiResponse";
import { rateLimit, clientKey } from "@/lib/rateLimit";
import { generateOtpCode, hashOtpCode } from "@/lib/otp";
import { sendOtpSms } from "@/lib/sms";

export const POST = handler(async (req) => {
  const rl = rateLimit({ key: clientKey(req, "register"), limit: 5, windowMs: 60000 });
  if (!rl.ok) return fail("Too many attempts. Please wait a moment.", 429);

  const json = await req.json().catch(() => ({}));
  const { name, phone, password } = registerSchema.parse(json);

  await connectDB();
  const exists = await User.findOne({ phone });
  if (exists) return fail("This phone number is already registered", 409);

  const user = await User.create({
    name,
    phone,
    password,
    status: "pending_verification",
    isPhoneVerified: false,
    isVerified: false,
  });
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

  return created({
    user: user.toPublic(),
    requiresVerification: true,
    phone: user.phone,
    mode: "signup",
  });
});
