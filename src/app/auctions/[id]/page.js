import SiteShell from "@/components/layout/SiteShell";
import AuctionDetail from "@/components/auction/AuctionDetail";
import { connectDB } from "@/lib/db";
import Auction from "@/models/Auction";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return { title: "Auction" };
    await connectDB();
    const a = await Auction.findById(id).select("title description images currentBid startingPrice").lean();
    if (!a) return { title: "Auction not found" };
    const price = a.currentBid > 0 ? a.currentBid : a.startingPrice;
    return {
      title: a.title,
      description: a.description?.slice(0, 160),
      openGraph: {
        title: `${a.title} — ৳${price}`,
        description: a.description?.slice(0, 160),
        images: a.images?.[0]?.url ? [a.images[0].url] : [],
        type: "website",
      },
      other: {
        "product:price:amount": String(price),
        "product:price:currency": "BDT",
      },
    };
  } catch {
    return { title: "Auction" };
  }
}

export default async function AuctionDetailPage({ params }) {
  const { id } = await params;
  return (
    <SiteShell>
      <AuctionDetail id={id} />
    </SiteShell>
  );
}
