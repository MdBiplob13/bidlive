import { z } from "zod";
import { ok, handler } from "@/lib/apiResponse";
import { getCurrentUser } from "@/lib/auth";
import { normalizePeriodType, calculateRankingItems } from "@/lib/rankings";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  period: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const GET = handler(async (req) => {
  const url = new URL(req.url);
  const parsedQuery = querySchema.parse(Object.fromEntries(url.searchParams.entries()));
  const periodType = normalizePeriodType(parsedQuery.period);
  const page = Math.max(1, Number(parsedQuery.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(parsedQuery.limit) || 10));

  const allItems = await calculateRankingItems(periodType);
  const user = await getCurrentUser();
  const userEntry = user ? allItems.find((entry) => String(entry.user) === String(user._id)) || null : null;

  return ok({
    items: allItems.slice((page - 1) * limit, (page - 1) * limit + limit),
    total: allItems.length,
    userEntry,
  });
});
