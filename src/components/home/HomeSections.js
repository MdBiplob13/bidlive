"use client";
import { Sparkles, TrendingUp, Clock } from "lucide-react";
import AuctionSection from "./AuctionSection";
import CategoryGrid from "./CategoryGrid";
import HowItWorks from "./HowItWorks";
import TrustSection from "./TrustSection";
import StatsSection from "./StatsSection";
import Testimonials from "./Testimonials";

/**
 * Client wrapper that receives only serializable data from the server page
 * and renders the full homepage body (icons/components resolved here).
 */
export default function HomeSections({ data }) {
  return (
    <>
      <AuctionSection
        titleKey="sections.featured"
        subKey="sections.featuredSub"
        href="/auctions"
        icon={Sparkles}
        auctions={data.featured}
      />

      <CategoryGrid categories={data.categories} />

      <AuctionSection
        titleKey="sections.trending"
        subKey="sections.trendingSub"
        href="/auctions?sort=trending"
        icon={TrendingUp}
        auctions={data.trending}
        badgeIcon="flame"
        badgeLabelKey="sections.trending"
        badgeVariant="accent"
      />

      <AuctionSection
        titleKey="sections.endingSoon"
        subKey="sections.endingSoonSub"
        href="/auctions?sort=ending"
        icon={Clock}
        auctions={data.endingSoon}
        badgeIcon="clock"
        badgeLabelKey="sections.endingSoon"
        badgeVariant="destructive"
      />

      <HowItWorks />
      <StatsSection stats={data.stats} />
      <TrustSection />
      <Testimonials items={data.testimonials} />
    </>
  );
}
