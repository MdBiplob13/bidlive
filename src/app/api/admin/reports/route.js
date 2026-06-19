import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { requireAdmin } from "@/lib/auth";
import { logAdmin } from "@/lib/adminLog";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export const GET = handler(async (req) => {
  await requireAdmin();
  await connectDB();
  const status = req.nextUrl.searchParams.get("status") || "open";
  const filter = status === "all" ? {} : { status };
  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("reporter", "name phone")
    .populate("targetUser", "name phone status")
    .populate("targetAuction", "title status")
    .lean();
  return ok({ reports: reports.map((r) => ({ ...r, _id: String(r._id) })) });
});

// PATCH { reportId, status: resolved|dismissed|reviewing, note? }
export const PATCH = handler(async (req) => {
  const admin = await requireAdmin();
  const { reportId, status, note } = await req.json();
  await connectDB();
  const report = await Report.findById(reportId);
  if (!report) return fail("Report not found", 404);
  report.status = status;
  report.resolvedBy = admin._id;
  report.resolutionNote = note || "";
  await report.save();
  await logAdmin({ admin: admin._id, action: `report.${status}`, targetType: "report", targetId: reportId, note });
  return ok({ report: { ...report.toObject(), _id: String(report._id) } });
});
