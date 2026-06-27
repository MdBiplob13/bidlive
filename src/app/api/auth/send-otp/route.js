import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { ok, fail, handler } from "@/lib/apiResponse";
import { otpRequestSchema } from "@/lib/validations";
import { generateOtpCode, hashOtpCode } from "@/lib/otp";

export const dynamic = "force-dynamic";

export const POST = handler(async (req) => {
  const payload = otpRequestSchema.parse(await req.json().catch(() => ({})));
  if (!payload.phone) return fail("Phone number is required", 400);

  await connectDB();
  const account = await User.findOne({ phone: payload.phone }).select(
    "+otpHash +otpExpiresAt +otpAttempts +otpResendCount +lastOtpSentAt +otpLockedUntil",
  );

  if (!account) return fail("User not found", 404);

  const otp = generateOtpCode();
  const otpHash = await hashOtpCode(otp);

  account.otpHash = otpHash;
  account.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  account.otpAttempts = 0;
  account.otpLockedUntil = null;
  account.otpResendCount = (account.otpResendCount || 0) + 1;
  account.lastOtpSentAt = new Date();
  await account.save();

  const smsUrl = "https://bulksmsbd.net/api/smsapi";
  const params = new URLSearchParams({
    api_key: process.env.BULK_SMS_API_KEY,
    senderid: process.env.BULK_SMS_SENDER_ID,
    number: account.phone,
    message: `Your Bid Live verification code is ${otp}`,
    type: "text",
  });

  const res = await fetch(`${smsUrl}?${params.toString()}`);
  const smsData = await res.json().catch(() => ({}));

  if (smsData?.response_code !== 202 && smsData?.response_code !== "202") {
    return fail(
      smsData?.message || smsData?.error_message || "Failed to send SMS",
      502,
      { smsData },
    );
  }

  return ok({
    status: "success",
    message: "OTP sent successfully",
    phone: account.phone,
  });
});
