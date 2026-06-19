import { connectDB } from "@/lib/db";
import Auction from "@/models/Auction";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const staticRoutes = ["", "/auctions", "/categories", "/how-it-works", "/login", "/register"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "hourly" : "daily",
    priority: p === "" ? 1 : 0.7,
  }));

  let auctionRoutes = [];
  try {
    await connectDB();
    const auctions = await Auction.find({ status: { $in: ["active", "sold", "ended"] } })
      .select("_id updatedAt")
      .sort({ createdAt: -1 })
      .limit(2000)
      .lean();
    auctionRoutes = auctions.map((a) => ({
      url: `${SITE_URL}/auctions/${a._id}`,
      lastModified: a.updatedAt || new Date(),
      changeFrequency: "hourly",
      priority: 0.6,
    }));
  } catch {
    /* DB unavailable at build — static routes still emitted */
  }

  return [...staticRoutes, ...auctionRoutes];
}
