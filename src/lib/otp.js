import crypto from "crypto";
import bcrypt from "bcryptjs";

export function generateOtpCode(length = 6) {
  const max = 10 ** length;
  return String(crypto.randomInt(0, max)).padStart(length, "0");
}

export async function hashOtpCode(code) {
  return bcrypt.hash(code, 10);
}

export async function compareOtpCode(code, hash) {
  return bcrypt.compare(code, hash);
}
