import { z } from "zod";
import { ok, created, handler } from "@/lib/apiResponse";
import { requireAdmin } from "@/lib/auth";
import RankingConfig from "@/models/RankingConfig";
import { connectDB } from "@/lib/db";

const configSchema = z.object({
  periodType: z.enum(["weekly", "monthly", "yearly"]),
  name: z.string().trim().min(2, "Name is required"),
  description: z.string().trim().optional().default(""),
  active: z.boolean().optional().default(true),
  topCount: z.number().min(1).optional().default(10),
  rules: z.array(
    z.object({
      rankStart: z.number().min(1),
      rankEnd: z.number().min(1),
      couponCode: z.string().trim().min(1),
    })
  ),
});

export const dynamic = "force-dynamic";

export const GET = handler(async (req) => {
  await requireAdmin();
  await connectDB();
  const url = new URL(req.url);
  const periodType = url.searchParams.get("period") || "weekly";
  const configs = await RankingConfig.find({ periodType, active: true }).sort({ createdAt: -1 }).lean();
  if (!configs?.length) {
    return ok({ configs: [getDefaultRankingConfig(periodType)] });
  }
  return ok({ configs });
});

export const POST = handler(async (req) => {
  await requireAdmin();
  await connectDB();
  const payload = await req.json();
  const validated = configSchema.parse(payload);
  const config = await RankingConfig.create(validated);
  return created({ config });
});
