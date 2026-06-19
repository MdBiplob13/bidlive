import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { ok, created, handler } from "@/lib/apiResponse";
import { slugify } from "@/lib/utils";

export const GET = handler(async () => {
  await connectDB();
  const categories = await Category.find({ isActive: true }).sort({ order: 1 }).lean();
  return ok({ categories: categories.map((c) => ({ ...c, _id: String(c._id) })) });
});

export const POST = handler(async (req) => {
  await requireAdmin();
  const body = await req.json();
  await connectDB();
  const cat = await Category.create({
    slug: body.slug || slugify(body.name?.en || ""),
    name: body.name,
    icon: body.icon || "package",
    order: body.order || 0,
  });
  return created({ category: { ...cat.toObject(), _id: String(cat._id) } });
});
