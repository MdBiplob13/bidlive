"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Users, Gavel, TrendingUp, ShoppingBag, Clock, Flag, BadgeCheck, Banknote, FileText } from "lucide-react";
import api from "@/lib/api";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthProvider";

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

function EmployeeDashboard({ permissions }) {
  const cards = [
    { label: "Auctions", href: "/admin/auctions", permission: "manage_auctions", icon: Gavel },
    { label: "Requests", href: "/admin/requests", permission: "manage_auctions", icon: FileText },
    { label: "Bids", href: "/admin/bids", permission: "manage_auctions", icon: TrendingUp },
    { label: "Wallets", href: "/admin/wallets", permission: "manage_wallets", icon: ShoppingBag },
    { label: "Reports", href: "/admin/reports", permission: "view_reports", icon: Flag },
    { label: "Users", href: "/admin/users", permission: "manage_users", icon: Users },
    { label: "Categories", href: "/admin/categories", permission: "manage_categories", icon: BadgeCheck },
  ];

  const permittedCards = cards.filter((card) => permissions?.includes(card.permission));

  return (
    <div>
      <PageHeader title="Staff Dashboard" subtitle="Your assigned admin tools" />
      <p className="text-sm text-muted-foreground">Use the menu and cards below to access sections permitted by your administrator.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {permittedCards.length > 0 ? (
          permittedCards.map((card) => (
            <Link key={card.href} href={card.href} className="rounded-xl border border-border bg-card p-6 shadow-card transition-colors hover:border-primary/40">
              <div className="flex items-center gap-3">
                <card.icon className="size-6 text-primary" />
                <h2 className="font-bold">{card.label}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Open the assigned section to manage its content.</p>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            You do not have any active admin permissions yet. Please contact an administrator to request access.
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get("/admin/stats")).data.data.stats,
    enabled: user?.role === "admin",
  });

  if (user?.role === "employee") {
    return <EmployeeDashboard permissions={user.permissions} />;
  }

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
