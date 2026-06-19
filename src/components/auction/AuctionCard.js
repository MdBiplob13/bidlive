"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Gavel, Eye, Flame, Clock } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka, toBanglaDigits } from "@/lib/currency";
import { Badge } from "@/components/ui/badge";
import Countdown from "./Countdown";

export default function AuctionCard({ auction, index = 0, badge }) {
  const { t, locale } = useLanguage();
  const price = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;
  const img = auction.images?.[0]?.url || "/placeholder.svg";
  const num = (n) => (locale === "bn" ? toBanglaDigits(n) : n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link
        href={`/auctions/${auction._id}`}
        className="group block overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-soft"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={img}
            alt={auction.title}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {badge && (
            <Badge variant={badge.variant || "accent"} className="absolute left-2 top-2 gap-1 shadow-soft">
              {badge.icon === "flame" && <Flame className="size-3" />}
              {badge.icon === "clock" && <Clock className="size-3" />}
              {badge.label}
            </Badge>
          )}
          {auction.reserveMet && (
            <Badge variant="success" className="absolute right-2 top-2 shadow-soft">
              {locale === "bn" ? "রিজার্ভ পূরণ" : "Reserve met"}
            </Badge>
          )}
        </div>

        <div className="space-y-2.5 p-3.5">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug group-hover:text-primary">
            {auction.title}
          </h3>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">{t("common.currentBid")}</p>
              <p className="text-lg font-extrabold text-primary">{formatTaka(price, { locale })}</p>
            </div>
            <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Gavel className="size-3" /> {num(auction.bidCount || 0)} {t("common.bids")}</span>
              <span className="flex items-center gap-1"><Eye className="size-3" /> {num(auction.views || 0)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 border-t border-border pt-2 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-accent" />
            <span className="text-foreground/70">{t("common.endsIn")}:</span>
            <Countdown endDate={auction.endDate} compact className="text-accent" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
