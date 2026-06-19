"use client";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import PageHeader from "@/components/dashboard/PageHeader";
import AuctionCard from "@/components/auction/AuctionCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistPage() {
  const { t, locale } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => (await api.get("/watchlist")).data.data.items,
  });

  return (
    <div>
      <PageHeader title={t("nav.watchlist")} />
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3]" />)}</div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Heart className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{locale === "bn" ? "আপনার ওয়াচলিস্ট খালি।" : "Your watchlist is empty."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {data.map((a, i) => <AuctionCard key={a._id} auction={a} index={i} />)}
        </div>
      )}
    </div>
  );
}
