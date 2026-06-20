"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, X, Star, Square, Gavel, User, Clock, Eye, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { formatTaka } from "@/lib/currency";
import { useLanguage } from "@/i18n/LanguageProvider";
import PageHeader from "@/components/dashboard/PageHeader";
import ImageSlider from "@/components/common/ImageSlider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_VARIANT = { pending: "muted", active: "success", sold: "default", ended: "secondary", rejected: "destructive", cancelled: "outline" };

function AdminAuctionsInner() {
  const qc = useQueryClient();
  const { locale } = useLanguage();
  const router = useRouter();
  const sp = useSearchParams();
  const [status, setStatus] = useState(sp.get("status") || "pending");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "auctions", status, page],
    queryFn: async () => (await api.get(`/admin/auctions?status=${status}&page=${page}`)).data.data,
  });

  const action = useMutation({
    mutationFn: async ({ auctionId, action, reason }) => api.patch("/admin/auctions", { auctionId, action, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "auctions"] }); toast.success("Done"); },
    onError: (e) => toast.error(e.message),
  });

  const reject = (id) => { const reason = prompt("Rejection reason?"); if (reason !== null) action.mutate({ auctionId: id, action: "reject", reason }); };

  const auctions = data?.auctions || [];

  return (
    <div>
      <PageHeader title="Auctions" subtitle={`${data?.total ?? "…"} total`}
        action={
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-40">
            {["pending", "active", "sold", "ended", "rejected", "cancelled", "all"].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        } />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
        </div>
      ) : !auctions.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <Gavel className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">No auctions found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((a) => (
            <div
              key={a._id}
              onClick={() => router.push(`/auctions/${a._id}`)}
              className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="p-2.5 pb-0">
                <ImageSlider images={a.images} alt={a.title} />
              </div>

              <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/auctions/${a._id}`} onClick={(e) => e.stopPropagation()} className="line-clamp-2 font-semibold leading-snug hover:text-primary">
                    {a.title}
                  </Link>
                  {a.isFeatured && <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
                  {a.category?.name && <Badge variant="outline">{a.category.name[locale] || a.category.name.en}</Badge>}
                </div>

                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Current price</p>
                  <p className="text-xl font-extrabold text-primary">{formatTaka(a.currentBid || a.startingPrice)}</p>
                  <p className="text-xs text-muted-foreground">{a.bidCount || 0} bids · starting {formatTaka(a.startingPrice)}</p>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="size-3.5" />
                    <span className="font-medium text-foreground">{a.seller?.name || "Unknown"}</span>
                    {a.seller?.phone && <span className="text-xs">· {a.seller.phone}</span>}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    Ends {new Date(a.endDate).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="size-3.5" />
                    {a.views || 0} views · {a.watchCount || 0} watching
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                  {a.status === "pending" && (
                    <>
                      <Button size="sm" disabled={action.isPending} onClick={() => action.mutate({ auctionId: a._id, action: "approve" })}>
                        <Check className="size-4" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={action.isPending} onClick={() => reject(a._id)}>
                        <X className="size-4" /> Reject
                      </Button>
                    </>
                  )}
                  {a.status === "active" && (
                    <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => confirm("Force close this auction now?") && action.mutate({ auctionId: a._id, action: "forceClose" })}>
                      <Square className="size-4" /> Close
                    </Button>
                  )}
                  <Button size="sm" variant={a.isFeatured ? "accent" : "outline"} disabled={action.isPending} onClick={() => action.mutate({ auctionId: a._id, action: "feature" })} title="Toggle feature">
                    <Star className="size-4" /> {a.isFeatured ? "Unfeature" : "Feature"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground">{page} / {data.pages}</span>
          <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

export default function AdminAuctionsPage() {
  return (
    <Suspense fallback={<div className="grid place-items-center py-40"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <AdminAuctionsInner />
    </Suspense>
  );
}
