import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import User from "@/models/User";
import { ok, fail, handler } from "@/lib/apiResponse";

const kycSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  idNumber: z.string().trim().min(4, "ID number is required"),
  documentFrontUrl: z.string().trim().url("Enter a valid front document URL"),
  documentBackUrl: z.string().trim().url("Enter a valid back document URL"),
  profilePhotoUrl: z.string().trim().url("Enter a valid profile photo URL").optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

export const dynamic = "force-dynamic";

export const POST = handler(async (req) => {
  const user = await requireUser();
  const body = await req.json();
  const { fullName, idNumber, documentFrontUrl, documentBackUrl, profilePhotoUrl, city, address } = kycSchema.parse(body);

  await connectDB();
  const account = await User.findById(user._id);
  if (!account) return fail("User not found", 404);

  if (["approved", "pending"].includes(account.kycStatus)) {
    return fail("KYC can only be submitted when status is rejected or not yet submitted.", 403);
  }

  account.kycStatus = "pending";
  account.kycName = fullName;
  account.kycIdNumber = idNumber;
  account.kycDocumentFront = documentFrontUrl;
  account.kycDocumentBack = documentBackUrl;
  if (profilePhotoUrl) account.avatar = profilePhotoUrl;
  if (city) account.city = city;
  if (address) account.address = address;
  account.kycNotes = "";
  await account.save();

  return ok({ message: "KYC submitted for review.", kycStatus: account.kycStatus });
});
