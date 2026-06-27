import { z } from "zod";
import { ok, handler } from "@/lib/apiResponse";
import { requireAdmin } from "@/lib/auth";
import { normalizePeriodType, calculateRankingItems } from "@/lib/rankings";

export const dynamic = "force-dynamic";

const processSchema = z.object({
  periodType: z.enum(["weekly", "monthly", "yearly"]).optional().default("weekly"),
});

export const GET = handler(async (req) => {
  await requireAdmin();
  const url = new URL(req.url);
  const periodType = normalizePeriodType(url.searchParams.get("period"));

  const items = await calculateRankingItems(periodType);
  return ok({ items });
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await req.json();
  const parsed = processSchema.parse(body);
  const periodType = normalizePeriodType(parsed.periodType);

  const items = await calculateRankingItems(periodType);
  return ok({ items });
});
