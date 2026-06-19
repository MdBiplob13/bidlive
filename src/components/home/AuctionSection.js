"use client";
import { useLanguage } from "@/i18n/LanguageProvider";
import AuctionCard from "@/components/auction/AuctionCard";
import SectionHeader from "./SectionHeader";

export default function AuctionSection({
  titleKey,
  subKey,
  href,
  icon,
  auctions = [],
  badgeIcon,
  badgeLabelKey,
  badgeVariant = "accent",
}) {
  const { t } = useLanguage();
  if (!auctions.length) return null;

  const badge = badgeLabelKey
    ? { icon: badgeIcon, label: t(badgeLabelKey), variant: badgeVariant }
    : undefined;

  return (
    <section className="container-tight py-10 sm:py-12">
      <SectionHeader title={t(titleKey)} subtitle={t(subKey)} href={href} icon={icon} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {auctions.map((a, i) => (
          <AuctionCard key={a._id} auction={a} index={i} badge={badge} />
        ))}
      </div>
    </section>
  );
}
