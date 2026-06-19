import { uploadImage } from "@/lib/cloudinary";
import { requireUser } from "@/lib/auth";
import { ok, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST /api/upload — accepts a base64 data URI (or remote URL) and stores it
 * in Cloudinary. Returns { url, publicId }.
 */
export const POST = handler(async (req) => {
  await requireUser();
  const { file, folder } = await req.json();
  if (!file) return fail("No file provided", 400);
  if (!process.env.CLOUDINARY_API_KEY)
    return fail("Image uploads are not configured (set CLOUDINARY_* env vars)", 503);

  const result = await uploadImage(file, folder || "bidlive/auctions");
  return ok(result);
});
