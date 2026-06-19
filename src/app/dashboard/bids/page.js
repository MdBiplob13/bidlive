"use client";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Gavel } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Countdown from "@/components/auction/Countdown";

export default function MyBidsPage() {
  const { t, locale } = useLanguage();
  const { data, isLoading } = useQuery({
    queryKey: ["me", "bids"],
    queryFn: async () => (await api.get("/me/bids")).data.data.items,
  });

  return (
    <div>
      <PageHeader title={t("nav.myBids")} subtitle={locale === "bn" ? "যে নিলামে বিড করেছেন" : "Auctions you've bid on"} />
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Gavel className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{locale === "bn" ? "এখনো কোনো বিড করেননি।" : "You haven't placed any bids yet."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((b) => (
            <Link key={b.auction._id} href={`/auctions/${b.auction._id}`} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={b.auction.images?.[0]?.url || "/placeholder.svg"} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{b.auction.title}</p>
                <p className="text-xs text-muted-foreground">{locale === "bn" ? "আপনার সর্বোচ্চ" : "Your max"}: {formatTaka(b.myMax, { locale })}</p>
                {b.auction.status === "active" && <div className="mt-1 text-xs text-accent"><Countdown endDate={b.auction.endDate} compact /></div>}
              </div>
              {b.auction.status !== "active"
                ? <Badge variant={b.auction.status === "sold" && b.leading ? "success" : "muted"}>{b.leading && b.auction.status === "sold" ? (locale === "bn" ? "জিতেছেন" : "Won") : b.auction.status}</Badge>
                : <Badge variant={b.leading ? "success" : "destructive"}>{b.leading ? (locale === "bn" ? "এগিয়ে" : "Leading") : (locale === "bn" ? "পিছিয়ে" : "Outbid")}</Badge>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
