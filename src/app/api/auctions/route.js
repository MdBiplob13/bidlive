import { connectDB } from "@/lib/db";
import Auction from "@/models/Auction";
import Category from "@/models/Category";
import { auctionSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";
import { ok, created, fail, handler } from "@/lib/apiResponse";
import { slugify } from "@/lib/utils";
import { settleExpiredAuctions } from "@/lib/auctionEngine";

export const dynamic = "force-dynamic";

// GET /api/auctions?q=&category=&sort=&status=&page=&limit=&seller=
export const GET = handler(async (req) => {
  await connectDB();
  // Lazy sweep: settle any expired auctions on read (cheap, capped).
  settleExpiredAuctions(20).catch(() => {});

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const categorySlug = sp.get("category");
  const sort = sp.get("sort") || "newest";
  const status = sp.get("status") || "active";
  const seller = sp.get("seller");
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10));
  const limit = Math.min(48, Math.max(1, parseInt(sp.get("limit") || "12", 10)));

  const filter = {};
  if (status !== "all") filter.status = status;
  if (status === "active") filter.endDate = { $gt: new Date() };
  if (q) filter.$text = { $search: q };
  if (seller) filter.seller = seller;
  if (categorySlug) {
    const cat = await Category.findOne({ slug: categorySlug }).select("_id").lean();
    if (cat) filter.category = cat._id;
    else return ok({ auctions: [], total: 0, page, pages: 0 });
  }

  const sortMap = {
    newest: { createdAt: -1 },
    ending: { endDate: 1 },
    trending: { views: -1 },
    price_low: { currentBid: 1, startingPrice: 1 },
    price_high: { currentBid: -1, startingPrice: -1 },
    most_bids: { bidCount: -1 },
  };

  const [auctions, total] = await Promise.all([
    Auction.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "slug name")
      .populate("seller", "name avatar isVerified")
      .lean(),
    Auction.countDocuments(filter),
  ]);

  return ok({
    auctions: auctions.map((a) => ({ ...a, _id: String(a._id) })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

// POST /api/auctions — create (pending approval)
export const POST = handler(async (req) => {
  const user = await requireUser();
  const json = await req.json();
  const data = auctionSchema.parse(json);

  await connectDB();
  const cat = await Category.findOne({ slug: data.category }).select("_id").lean();
  if (!cat) return fail("Invalid category", 400);

  const auction = await Auction.create({
    title: data.title,
    slug: slugify(data.title),
    description: data.description,
    category: cat._id,
    seller: user._id,
    images: data.images.map((url) => ({ url })),
    condition: data.condition,
    location: data.location || "Bangladesh",
    startingPrice: data.startingPrice,
    reservePrice: data.reservePrice || 0,
    bidIncrement: data.bidIncrement || 0,
    endDate: data.endDate,
    status: "pending", // admin approves before going live
  });

  return created({ auction: { ...auction.toObject(), _id: String(auction._id) } });
});
