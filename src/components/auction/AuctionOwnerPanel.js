"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Eye, Gavel, Heart, Ban, Trash2, LayoutDashboard } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = { pending: "muted", active: "success", sold: "default", ended: "secondary", rejected: "destructive", cancelled: "outline" };

export default function AuctionOwnerPanel({ auction }) {
  const { locale } = useLanguage();
  const router = useRouter();
  const qc = useQueryClient();

  const cancel = useMutation({
    mutationFn: async () => api.patch(`/auctions/${auction._id}`, { action: "cancel" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["auction", auction._id] }); toast.success(locale === "bn" ? "নিলাম বাতিল হয়েছে" : "Auction cancelled"); },
    onError: (e) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async () => api.delete(`/auctions/${auction._id}`),
    onSuccess: () => { toast.success(locale === "bn" ? "মুছে ফেলা হয়েছে" : "Deleted"); router.push("/dashboard/auctions"); },
    onError: (e) => toast.error(e.message),
  });

  const noBids = !(auction.bidCount > 0);
  const canCancel = noBids && ["pending", "active"].includes(auction.status);
  const canDelete = noBids && ["pending", "rejected"].includes(auction.status);
  const busy = cancel.isPending || del.isPending;

  const stats = [
    { icon: Eye, label: locale === "bn" ? "ভিউ" : "Views", value: auction.views || 0 },
    { icon: Gavel, label: locale === "bn" ? "বিড" : "Bids", value: auction.bidCount || 0 },
    { icon: Heart, label: locale === "bn" ? "ওয়াচিং" : "Watching", value: auction.watchCount || 0 },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === "bn" ? "আপনার নিলাম" : "Your listing"}
        </p>
        <Badge variant={STATUS_VARIANT[auction.status]}>{auction.status}</Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-muted/50 p-2.5 text-center">
            <s.icon className="mx-auto mb-1 size-4 text-muted-foreground" />
            <p className="text-lg font-extrabold leading-none">{s.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {auction.status === "rejected" && auction.rejectionReason && (
        <p className="mt-3 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
          {locale === "bn" ? "কারণ" : "Reason"}: {auction.rejectionReason}
        </p>
      )}

      <div className="mt-4 space-y-2">
        <Button asChild variant="secondary" className="w-full">
          <Link href="/dashboard/auctions"><LayoutDashboard className="size-4" /> {locale === "bn" ? "ড্যাশবোর্ডে পরিচালনা করুন" : "Manage in dashboard"}</Link>
        </Button>
        {canCancel && (
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => confirm(locale === "bn" ? "এই নিলাম বাতিল করবেন?" : "Cancel this auction?") && cancel.mutate()}>
            <Ban className="size-4" /> {locale === "bn" ? "নিলাম বাতিল করুন" : "Cancel auction"}
          </Button>
        )}
        {canDelete && (
          <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" disabled={busy} onClick={() => confirm(locale === "bn" ? "এই নিলাম মুছে ফেলবেন?" : "Delete this auction?") && del.mutate()}>
            <Trash2 className="size-4" /> {locale === "bn" ? "মুছে ফেলুন" : "Delete"}
          </Button>
        )}
      </div>
    </div>
  );
}
