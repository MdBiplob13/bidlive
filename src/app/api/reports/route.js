import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { reportSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";
import { created, ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// POST /api/reports — user reports an auction or another user
export const POST = handler(async (req) => {
  const user = await requireUser();
  const data = reportSchema.parse(await req.json());
  await connectDB();
  const report = await Report.create({
    reporter: user._id,
    targetType: data.targetType,
    targetAuction: data.targetType === "auction" ? data.targetId : null,
    targetUser: data.targetType === "user" ? data.targetId : null,
    reason: data.reason,
    details: data.details || "",
  });
  return created({ report: { ...report.toObject(), _id: String(report._id) } });
});

// GET /api/reports — current user's submitted reports
export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const reports = await Report.find({ reporter: user._id }).sort({ createdAt: -1 }).lean();
  return ok({ reports: reports.map((r) => ({ ...r, _id: String(r._id) })) });
});
