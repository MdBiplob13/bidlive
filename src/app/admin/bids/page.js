"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Trash2, Gavel, Zap, User, Clock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import ImageSlider from "@/components/common/ImageSlider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_VARIANT = { active: "success", outbid: "muted", won: "default", lost: "outline" };

export default function AdminBidsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "bids", status, type, page],
    queryFn: async () => (await api.get(`/admin/bids?status=${status}&type=${type}&page=${page}`)).data.data,
  });

  const del = useMutation({
    mutationFn: async (bidId) => api.delete("/admin/bids", { data: { bidId } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "bids"] }); toast.success("Bid deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const bids = data?.bids || [];

  return (
    <div>
      <PageHeader
        title="Bids"
        subtitle={`${data?.total ?? "…"} total`}
        action={
          <div className="flex gap-2">
            <Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-32">
              <option value="all">All types</option>
              <option value="manual">Manual</option>
              <option value="proxy">Auto</option>
            </Select>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-32">
              {["all", "active", "outbid", "won", "lost"].map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
        </div>
      ) : !bids.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <Gavel className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">No bids found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bids.map((b) => (
            <div key={b._id} className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
              <div className="p-2.5 pb-0">
                <ImageSlider images={b.auction?.images} alt={b.auction?.title || "auction"} />
              </div>

              <div className="flex flex-1 flex-col gap-2.5 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  {b.auction ? (
                    <Link href={`/auctions/${b.auction._id}`} className="line-clamp-2 font-semibold leading-snug hover:text-primary">
                      {b.auction.title}
                    </Link>
                  ) : (
                    <span className="italic text-muted-foreground">Auction deleted</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={STATUS_VARIANT[b.status] || "muted"}>{b.status}</Badge>
                  <Badge variant={b.type === "proxy" ? "accent" : "secondary"} className="gap-1">
                    {b.type === "proxy" ? <><Zap className="size-3" /> auto</> : "manual"}
                  </Badge>
                  {b.auction?.status && <Badge variant="outline">{b.auction.status}</Badge>}
                </div>

                <div className="rounded-lg bg-muted/50 p-2.5">
                  <p className="text-xs text-muted-foreground">Bid amount</p>
                  <p className="text-xl font-extrabold text-primary">{formatTaka(b.amount)}</p>
                  {b.isAutoBid && b.maxAutoBid > 0 && (
                    <p className="text-xs text-muted-foreground">Max auto-bid: {formatTaka(b.maxAutoBid)}</p>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="size-3.5" />
                    <span className="font-medium text-foreground">{b.bidder?.name || "Unknown"}</span>
                    {b.bidder?.phone && <span className="text-xs">· {b.bidder.phone}</span>}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {new Date(b.createdAt).toLocaleString()}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-auto text-destructive hover:bg-destructive/10"
                  disabled={del.isPending}
                  onClick={() => confirm("Delete this bid? The auction's current price will be recalculated.") && del.mutate(b._id)}
                >
                  <Trash2 className="size-4" /> Delete bid
                </Button>
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
