import { connectDB } from "@/lib/db";
import { settleExpiredAuctions } from "@/lib/auctionEngine";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/settle — settle all expired auctions. Protect with a secret
 * header so only your scheduler (e.g. Vercel Cron / external cron) can call it.
 *   Authorization: Bearer <CRON_SECRET>
 */
export const GET = handler(async (req) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) return fail("Unauthorized", 401);
  }
  await connectDB();
  const results = await settleExpiredAuctions(200);
  return ok({ settled: results.length });
});
