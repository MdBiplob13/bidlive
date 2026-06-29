"use client";
import Link from "next/link";
import { Award, BadgeCheck, Clock, Gavel, ShieldCheck, TrendingUp, Wallet } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import AuctionSection from "./AuctionSection";
import AuctionCard from "../auction/AuctionCard";
import CategoryGrid from "./CategoryGrid";
import HowItWorks from "./HowItWorks";
import TrustSection from "./TrustSection";
import TrustSecuritySection from "./TrustSecuritySection";
import StatsSection from "./StatsSection";
import Testimonials from "./Testimonials";

const FEATURED_AUCTIONS = [
  { id: 1, titleKey: "home.featuredAuction1.title", statsKey: "home.featuredAuction1.stats", badgeKey: "home.featuredAuction1.badge" },
  { id: 2, titleKey: "home.featuredAuction2.title", statsKey: "home.featuredAuction2.stats", badgeKey: "home.featuredAuction2.badge" },
  { id: 3, titleKey: "home.featuredAuction3.title", statsKey: "home.featuredAuction3.stats", badgeKey: "home.featuredAuction3.badge" },
  { id: 4, titleKey: "home.featuredAuction4.title", statsKey: "home.featuredAuction4.stats", badgeKey: "home.featuredAuction4.badge" },
];

const WALLET_FEATURES = [
  { icon: Wallet, titleKey: "home.walletFeatures.instantTopUp.title", bodyKey: "home.walletFeatures.instantTopUp.body" },
  { icon: ShieldCheck, titleKey: "home.walletFeatures.secureEscrow.title", bodyKey: "home.walletFeatures.secureEscrow.body" },
  { icon: BadgeCheck, titleKey: "home.walletFeatures.couponRewards.title", bodyKey: "home.walletFeatures.couponRewards.body" },
];

const GRID_5_CARDS = "grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5";

export default function HomeSections({ data }) {
  const { t } = useLanguage();

  return (
    <>
      <AuctionSection
        titleKey="sections.featured"
        subKey="sections.featuredSub"
        href="/auctions"
        icon={Gavel}
        auctions={data.featured}
        limit={5}
        mobileLimit={4}
        columns={GRID_5_CARDS}
      />

      <section className="w-full bg-muted py-10 sm:py-14">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.14fr_0.86fr]">
            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                <Award className="size-5 text-accent" />
                {t("sections.featured")}
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t("home.featuredAuctionsHeadline")}
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                {t("home.featuredAuctionsDescription")}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURED_AUCTIONS.map((auction) => (
                <div key={auction.id} className="rounded-[1.75rem] border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t(auction.titleKey)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t(auction.statsKey)}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      {t(auction.badgeKey)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">★</span>
                    {t("home.auctionRating")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CategoryGrid categories={data.categories} />

      {/* <TrustSecuritySection /> */}

      <AuctionSection
        titleKey="sections.trending"
        subKey="sections.trendingSub"
        href="/auctions?sort=trending"
        icon={TrendingUp}
        auctions={data.trending}
        badgeIcon="flame"
        badgeLabelKey="sections.trending"
        badgeVariant="accent"
        limit={5}
        mobileLimit={4}
        columns={GRID_5_CARDS}
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
        limit={5}
        mobileLimit={4}
        columns={GRID_5_CARDS}
      />

      <section className="w-full bg-muted py-12 sm:py-14">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">{t("sections.wallet")}</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t("sections.wallet")}
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
                {t("sections.walletSub")}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {WALLET_FEATURES.map((feature) => (
                  <div key={feature.titleKey} className="rounded-3xl border border-border bg-card p-5 shadow-card">
                    <feature.icon className="size-6 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{t(feature.titleKey)}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t(feature.bodyKey)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
              <div className="rounded-[1.75rem] border border-border/80 bg-background p-6">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <Wallet className="size-5 text-primary" />
                  {t("home.walletBalancePreview.title")}
                </div>
                <p className="mt-4 text-3xl font-extrabold text-foreground">{t("home.walletBalancePreview.amount")}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("home.walletBalancePreview.subtitle")}</p>
                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                    {t("home.walletBalancePreview.instantFunding")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                    {t("home.walletBalancePreview.couponsUnlocked")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 sm:py-14">
        <div className="mx-auto w-full max-w-[1800px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t("sections.becomeSeller")}</p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {t("home.becomeSellerHeadline")}
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                {t("home.becomeSellerDescription")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard/auctions/new" className="inline-flex items-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90">
                  {t("home.startListing")}
                </Link>
                <Link href="/contact" className="inline-flex items-center rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted">
                  {t("common.seeMore")}
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              {[
                { titleKey: "home.sellerBenefits.fastListing.title", descriptionKey: "home.sellerBenefits.fastListing.description" },
                { titleKey: "home.sellerBenefits.secureSupport.title", descriptionKey: "home.sellerBenefits.secureSupport.description" },
                { titleKey: "home.sellerBenefits.audienceAccess.title", descriptionKey: "home.sellerBenefits.audienceAccess.description" },
              ].map((item) => (
                <div key={item.titleKey} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                  <p className="text-sm font-semibold text-foreground">{t(item.titleKey)}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{t(item.descriptionKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <StatsSection stats={data.stats} />
      <TrustSection />
      <Testimonials items={data.testimonials} />
    </>
  );
}
