import { connectDB } from "@/lib/db";
import Auction from "@/models/Auction";
import Category from "@/models/Category";
import User from "@/models/User";
import Bid from "@/models/Bid";
import Order from "@/models/Order";
import {
  SAMPLE_AUCTIONS,
  SAMPLE_CATEGORIES,
  SAMPLE_TESTIMONIALS,
} from "@/lib/sampleData";

/** Convert a lean auction doc to a plain, serializable card object. */
function card(a) {
  return {
    _id: String(a._id),
    title: a.title,
    images: (a.images || []).map((im) => ({ url: im.url })),
    startingPrice: a.startingPrice,
    currentBid: a.currentBid || 0,
    bidCount: a.bidCount || 0,
    views: a.views || 0,
    reserveMet: !!a.reserveMet,
    endDate: new Date(a.endDate).toISOString(),
  };
}

/**
 * Fetch everything the homepage needs in one place. Falls back to rich sample
 * data when the DB is empty or unreachable, so the homepage always looks great.
 */
export async function getHomeData() {
  try {
    await connectDB();
    const baseQuery = { status: "active", endDate: { $gt: new Date() } };

    const [featuredRaw, trendingRaw, endingRaw, cats, users, auctionsCount, bidsCount, soldCount] =
      await Promise.all([
        Auction.find({ ...baseQuery, isFeatured: true }).sort({ createdAt: -1 }).limit(8).lean(),
        Auction.find(baseQuery).sort({ views: -1 }).limit(8).lean(),
        Auction.find(baseQuery).sort({ endDate: 1 }).limit(8).lean(),
        Category.find({ isActive: true }).sort({ order: 1 }).limit(8).lean(),
        User.countDocuments(),
        Auction.countDocuments(),
        Bid.countDocuments(),
        Order.countDocuments(),
      ]);

    let featured = featuredRaw.map(card);
    if (!featured.length) {
      // fall back to newest active if nothing flagged featured
      const newest = await Auction.find(baseQuery).sort({ createdAt: -1 }).limit(8).lean();
      featured = newest.map(card);
    }

    const categories = cats.length
      ? cats.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))
      : SAMPLE_CATEGORIES;

    const hasData = featured.length || trendingRaw.length;

    return {
      featured: featured.length ? featured : SAMPLE_AUCTIONS,
      trending: trendingRaw.length ? trendingRaw.map(card) : SAMPLE_AUCTIONS.slice(2, 8),
      endingSoon: endingRaw.length ? endingRaw.map(card) : SAMPLE_AUCTIONS.slice(0, 4),
      categories,
      stats: hasData
        ? { users, auctions: auctionsCount, bids: bidsCount, sold: soldCount }
        : null,
      testimonials: SAMPLE_TESTIMONIALS,
      isLive: !!hasData,
    };
  } catch (e) {
    console.warn("[homeData] DB unavailable, using sample data:", e.message);
    return {
      featured: SAMPLE_AUCTIONS,
      trending: SAMPLE_AUCTIONS.slice(2, 8),
      endingSoon: SAMPLE_AUCTIONS.slice(0, 4),
      categories: SAMPLE_CATEGORIES,
      stats: null,
      testimonials: SAMPLE_TESTIMONIALS,
      isLive: false,
    };
  }
}
