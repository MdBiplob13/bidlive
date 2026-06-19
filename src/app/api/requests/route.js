import { connectDB } from "@/lib/db";
import Request from "@/models/Request";
import Category from "@/models/Category";
import { requestSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";
import { ok, created, fail, handler } from "@/lib/apiResponse";

export const dynamic = "force-dynamic";

// GET /api/requests?scope=mine|open
export const GET = handler(async (req) => {
  const user = await requireUser();
  await connectDB();
  const scope = req.nextUrl.searchParams.get("scope") || "mine";
  const filter = scope === "open" ? { status: "open" } : { user: user._id };
  const requests = await Request.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("category", "name slug")
    .populate("user", "name")
    .lean();
  return ok({ requests: requests.map((r) => ({ ...r, _id: String(r._id) })) });
});

// POST /api/requests — buyer posts a "looking for" request
export const POST = handler(async (req) => {
  const user = await requireUser();
  const data = requestSchema.parse(await req.json());
  await connectDB();
  const cat = await Category.findOne({ slug: data.category }).select("_id").lean();
  if (!cat) return fail("Invalid category", 400);
  const request = await Request.create({
    user: user._id,
    title: data.title,
    description: data.description,
    category: cat._id,
    budgetMin: data.budgetMin || 0,
    budgetMax: data.budgetMax || 0,
  });
  return created({ request: { ...request.toObject(), _id: String(request._id) } });
});
