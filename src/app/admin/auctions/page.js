"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, X, Star, Square, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

const STATUS_VARIANT = { pending: "muted", active: "success", sold: "default", ended: "secondary", rejected: "destructive", cancelled: "outline" };

function AdminAuctionsInner() {
  const qc = useQueryClient();
  const sp = useSearchParams();
  const [status, setStatus] = useState(sp.get("status") || "pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "auctions", status],
    queryFn: async () => (await api.get(`/admin/auctions?status=${status}`)).data.data,
  });

  const action = useMutation({
    mutationFn: async ({ auctionId, action, reason }) => api.patch("/admin/auctions", { auctionId, action, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin", "auctions"] }); toast.success("Done"); },
    onError: (e) => toast.error(e.message),
  });

  const reject = (id) => { const reason = prompt("Rejection reason?"); if (reason !== null) action.mutate({ auctionId: id, action: "reject", reason }); };

  return (
    <div>
      <PageHeader title="Auctions" subtitle={`${data?.total ?? "…"} total`}
        action={
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40">
            {["pending", "active", "sold", "ended", "rejected", "cancelled", "all"].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        } />

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="size-7 animate-spin text-primary" /></div>
      ) : !data?.auctions?.length ? (
        <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">No auctions</p>
      ) : (
        <div className="space-y-3">
          {data.auctions.map((a) => (
            <div key={a._id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="min-w-0 flex-1">
                <Link href={`/auctions/${a._id}`} className="font-semibold hover:text-primary">{a.title}</Link>
                <p className="text-xs text-muted-foreground">{a.seller?.name} · {a.seller?.phone} · {formatTaka(a.currentBid || a.startingPrice)} · {a.bidCount || 0} bids</p>
              </div>
              <Badge variant={STATUS_VARIANT[a.status]}>{a.status}</Badge>
              <div className="flex gap-1">
                {a.status === "pending" && (
                  <>
                    <Button size="sm" onClick={() => action.mutate({ auctionId: a._id, action: "approve" })}><Check className="size-4" /> Approve</Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => reject(a._id)}><X className="size-4" /></Button>
                  </>
                )}
                {a.status === "active" && (
                  <Button size="sm" variant="outline" onClick={() => confirm("Force close this auction now?") && action.mutate({ auctionId: a._id, action: "forceClose" })}><Square className="size-4" /> Close</Button>
                )}
                <Button size="sm" variant={a.isFeatured ? "accent" : "outline"} onClick={() => action.mutate({ auctionId: a._id, action: "feature" })} title="Feature"><Star className="size-4" /></Button>
              </div>
            </div>
          ))}
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
