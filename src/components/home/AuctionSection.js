"use client";
import { useLanguage } from "@/i18n/LanguageProvider";
import AuctionCard from "@/components/auction/AuctionCard";
import SectionHeader from "./SectionHeader";

const DEFAULT_AUCTION_GRID = "grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5";

export default function AuctionSection({
  titleKey,
  subKey,
  title,
  subtitle,
  href,
  icon,
  auctions = [],
  badgeIcon,
  badgeLabelKey,
  badgeVariant = "accent",
  hideHeader = false,
  limit = auctions.length,
  mobileLimit = limit,
  columns = DEFAULT_AUCTION_GRID,
}) {
  const { t } = useLanguage();
  if (!auctions.length) return null;

  const heading = title || (titleKey ? t(titleKey) : undefined);
  const lead = subtitle || (subKey ? t(subKey) : undefined);
  const badge = badgeLabelKey
    ? { icon: badgeIcon, label: t(badgeLabelKey), variant: badgeVariant }
    : undefined;
  const visibleAuctions = auctions.slice(0, limit);
  const showMobileViewMore = href && auctions.length > mobileLimit;

  return (
    <section className="w-full py-16 sm:py-20">
      {!hideHeader && (heading || lead) && (
        <div className="container-tight">
          <SectionHeader title={heading} subtitle={lead} href={href} icon={icon} />
        </div>
      )}
      <div className="container-tight">
        <div className={columns}>
          {visibleAuctions.map((a, i) => (
            <div key={a._id} className={i === mobileLimit ? "hidden sm:block" : ""}>
              <AuctionCard auction={a} index={i} badge={badge} />
            </div>
          ))}
        </div>
        {showMobileViewMore && (
          <div className="mt-5 text-center sm:hidden">
            <a
              href={href}
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              {t("common.viewAll")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
