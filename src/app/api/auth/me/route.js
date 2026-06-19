import { getCurrentUser } from "@/lib/auth";
import { ok, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await getCurrentUser();
  return ok({ user: user || null });
});
