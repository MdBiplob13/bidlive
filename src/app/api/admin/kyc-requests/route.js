import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requirePermission("manage_auctions");
  await connectDB();

  const users = await User.find({ kycStatus: "pending" })
    .select("name phone kycName kycIdNumber kycDocumentFront kycDocumentBack avatar city address")
    .sort({ updatedAt: -1 })
    .lean();

  return ok({
    requests: users.map((u) => ({
      _id: String(u._id),
      name: u.kycName || u.name,
      phone: u.phone,
      kycName: u.kycName,
      kycIdNumber: u.kycIdNumber,
      kycDocumentFront: u.kycDocumentFront,
      kycDocumentBack: u.kycDocumentBack,
      avatar: u.avatar,
      city: u.city,
      address: u.address,
    })),
  });
});