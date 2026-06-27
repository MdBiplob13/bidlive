import { ok, handler } from "@/lib/apiResponse";
import { requireAdmin } from "@/lib/auth";
import RankingConfig from "@/models/RankingConfig";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export const DELETE = handler(async (req, { params }) => {
  await requireAdmin();
  await connectDB();
  const { id } = params;
  const config = await RankingConfig.findById(id);
  if (!config) return ok({ deleted: false });
  await config.deleteOne();
  return ok({ deleted: true });
});
