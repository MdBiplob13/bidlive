"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Check, X, Star, Square, Trash2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = { pending: "muted", active: "success", sold: "default", ended: "secondary", rejected: "destructive", cancelled: "outline" };

export default function AuctionAdminPanel({ auction }) {
  const { locale } = useLanguage();
  const router = useRouter();
  const qc = useQueryClient();
  const current = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;

  const action = useMutation({
    mutationFn: async ({ act, reason }) => api.patch("/admin/auctions", { auctionId: auction._id, action: act, reason }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["auction", auction._id] }); toast.success(locale === "bn" ? "সম্পন্ন হয়েছে" : "Done"); },
    onError: (e) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async () => api.delete(`/auctions/${auction._id}`),
    onSuccess: () => { toast.success(locale === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted"); router.push("/admin/auctions"); },
    onError: (e) => toast.error(e.message),
  });

  const reject = () => {
    const reason = prompt(locale === "bn" ? "প্রত্যাখ্যানের কারণ?" : "Rejection reason?");
    if (reason !== null) action.mutate({ act: "reject", reason });
  };

  const canDelete = !["active", "sold"].includes(auction.status) && !(auction.bidCount > 0);
  const busy = action.isPending || del.isPending;

  return (
    <div className="rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-card">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <ShieldCheck className="size-4" /> {locale === "bn" ? "অ্যাডমিন নিয়ন্ত্রণ" : "Admin controls"}
      </p>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{locale === "bn" ? "বর্তমান মূল্য" : "Current price"}</p>
          <p className="text-3xl font-extrabold text-primary">{formatTaka(current, { locale })}</p>
        </div>
        <Badge variant={STATUS_VARIANT[auction.status]}>{auction.status}</Badge>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {auction.bidCount || 0} {locale === "bn" ? "বিড" : "bids"} · {auction.views || 0} {locale === "bn" ? "ভিউ" : "views"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {auction.status === "pending" && (
          <>
            <Button size="sm" disabled={busy} onClick={() => action.mutate({ act: "approve" })}>
              <Check className="size-4" /> {locale === "bn" ? "অনুমোদন" : "Approve"}
            </Button>
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={busy} onClick={reject}>
              <X className="size-4" /> {locale === "bn" ? "প্রত্যাখ্যান" : "Reject"}
            </Button>
          </>
        )}
        {auction.status === "active" && (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => confirm(locale === "bn" ? "এখনই নিলাম বন্ধ করবেন?" : "Force close this auction now?") && action.mutate({ act: "forceClose" })}>
            <Square className="size-4" /> {locale === "bn" ? "বন্ধ করুন" : "Close"}
          </Button>
        )}
        <Button size="sm" variant={auction.isFeatured ? "accent" : "outline"} disabled={busy} onClick={() => action.mutate({ act: "feature" })}>
          <Star className="size-4" /> {auction.isFeatured ? (locale === "bn" ? "আনফিচার" : "Unfeature") : (locale === "bn" ? "ফিচার" : "Feature")}
        </Button>
        {canDelete && (
          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" disabled={busy} onClick={() => confirm(locale === "bn" ? "এই নিলাম মুছে ফেলবেন?" : "Delete this auction?") && del.mutate()}>
            <Trash2 className="size-4" /> {locale === "bn" ? "মুছুন" : "Delete"}
          </Button>
        )}
      </div>
    </div>
  );
}
