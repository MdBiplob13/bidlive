import { cookies } from "next/headers";
import { buildClearCookie } from "@/lib/cookies";
import { ok, handler } from "@/lib/apiResponse";

export const POST = handler(async () => {
  const c = buildClearCookie();
  (await cookies()).set(c.name, c.value, c.options);
  return ok({ loggedOut: true });
});
