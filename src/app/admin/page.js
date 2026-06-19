"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, Gavel, TrendingUp, ShoppingBag, Clock, Flag, BadgeCheck, Banknote } from "lucide-react";
import api from "@/lib/api";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";

function Stat({ icon: Icon, label, value, accent, href }) {
  const Comp = href ? Link : "div";
  return (
    <Comp href={href} className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-extrabold">{value}</p>
        </div>
        <div className={`grid size-11 place-items-center rounded-lg ${accent}`}><Icon className="size-5" /></div>
      </div>
    </Comp>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get("/admin/stats")).data.data.stats,
  });

  if (isLoading) {
    return (
      <>
        <PageHeader title="Admin Dashboard" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      </>
    );
  }

  const s = data || {};
  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Users} label="Total users" value={s.users} accent="bg-primary/10 text-primary" href="/admin/users" />
        <Stat icon={Gavel} label="Total auctions" value={s.auctions} accent="bg-accent/10 text-accent" href="/admin/auctions" />
        <Stat icon={TrendingUp} label="Total bids" value={s.bids} accent="bg-success/10 text-success" />
        <Stat icon={ShoppingBag} label="Orders" value={s.orders} accent="bg-primary/10 text-primary" />
        <Stat icon={Clock} label="Pending approval" value={s.pendingAuctions} accent="bg-destructive/10 text-destructive" href="/admin/auctions?status=pending" />
        <Stat icon={Flag} label="Open reports" value={s.openReports} accent="bg-destructive/10 text-destructive" href="/admin/reports" />
        <Stat icon={BadgeCheck} label="Sold" value={s.soldAuctions} accent="bg-success/10 text-success" />
        <Stat icon={Banknote} label="GMV" value={formatTaka(s.gmv || 0)} accent="bg-accent/10 text-accent" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/auctions?status=pending" className="rounded-xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/40">
          <Clock className="mb-2 size-6 text-accent" />
          <p className="font-bold">Review pending auctions</p>
          <p className="text-sm text-muted-foreground">{s.pendingAuctions || 0} waiting for approval</p>
        </Link>
        <Link href="/admin/reports" className="rounded-xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/40">
          <Flag className="mb-2 size-6 text-destructive" />
          <p className="font-bold">Handle reports</p>
          <p className="text-sm text-muted-foreground">{s.openReports || 0} open reports</p>
        </Link>
      </div>
    </div>
  );
}
