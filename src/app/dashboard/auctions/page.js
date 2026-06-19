"use client";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Plus, Gavel } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_VARIANT = {
  pending: "muted", active: "success", sold: "default",
  ended: "secondary", rejected: "destructive", cancelled: "outline",
};

export default function MyAuctionsPage() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["my-auctions", user?._id],
    enabled: !!user?._id,
    queryFn: async () => (await api.get(`/auctions?seller=${user._id}&status=all&limit=48`)).data.data.auctions,
  });

  return (
    <div>
      <PageHeader
        title={t("nav.myAuctions")}
        action={<Button asChild><Link href="/dashboard/auctions/new"><Plus className="size-4" /> {t("nav.sell")}</Link></Button>}
      />
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Gavel className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{locale === "bn" ? "আপনি এখনো কোনো নিলাম তৈরি করেননি।" : "You haven't created any auctions yet."}</p>
          <Button asChild><Link href="/dashboard/auctions/new"><Plus className="size-4" /> {t("nav.sell")}</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <Link key={a._id} href={`/auctions/${a._id}`} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={a.images?.[0]?.url || "/placeholder.svg"} alt="" fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.bidCount || 0} {t("common.bids")} · {a.views || 0} views</p>
                <p className="mt-1 font-bold text-primary">{formatTaka(a.currentBid || a.startingPrice, { locale })}</p>
              </div>
              <Badge variant={STATUS_VARIANT[a.status] || "muted"}>{a.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
