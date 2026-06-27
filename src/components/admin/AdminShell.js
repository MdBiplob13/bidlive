"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Gavel,
  Flag,
  FileText,
  ScrollText,
  ShieldCheck,
  Menu,
  X,
  Home,
  Tags,
  TrendingUp,
  Wallet,
  Ticket,
  Trophy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/common/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    permission: "manage_users",
  },
  {
    href: "/admin/employees",
    label: "Employees",
    icon: ShieldCheck,
    permission: "admin_only",
  },
  {
    href: "/admin/wallets",
    label: "Wallets",
    icon: Wallet,
    permission: "manage_wallets",
  },
  {
    href: "/admin/coupons",
    label: "Coupons",
    icon: Ticket,
    permission: "manage_wallets",
  },
  {
    href: "/admin/rankings",
    label: "Rankings",
    icon: Trophy,
    permission: "manage_wallets",
  },
  {
    href: "/admin/auctions",
    label: "Auctions",
    icon: Gavel,
    permission: "manage_auctions",
  },
  {
    href: "/admin/bids",
    label: "Bids",
    icon: TrendingUp,
    permission: "manage_auctions",
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
    permission: "manage_categories",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: Flag,
    permission: "view_reports",
  },
  {
    href: "/admin/requests",
    label: "Requests",
    icon: FileText,
    permission: "manage_auctions",
  },
  {
    href: "/admin/logs",
    label: "Logs",
    icon: ScrollText,
    permission: "admin_only",
  },
];

function NavList({ user, pendingRequestCount, onNavigate, logout }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.filter((item) => {
        if (user?.role === "admin") return true;
        if (!item.permission) return true;
        if (item.permission === "admin_only") return false;
        return user?.permissions?.includes(item.permission);
      }).map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="size-4.5" /> {item.label}
            {item.href === "/admin/requests" && pendingRequestCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-auto text-[10px] uppercase tracking-[0.08em]"
              >
                {pendingRequestCount}
              </Badge>
            )}
          </Link>
        );
      })}
      <Link
        href="/"
        onClick={onNavigate}
        className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <Home className="size-4.5" /> Back to site
      </Link>
      <button
        onClick={logout}
        className="mt-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
      >
        Logout
      </button>
    </nav>
  );
}

export default function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const canViewRequests =
    user?.role === "admin" || user?.permissions?.includes("manage_auctions");
  const { data } = useQuery({
    queryKey: ["admin", "request-summary"],
    queryFn: async () => (await api.get("/admin/requests/summary")).data.data,
    enabled: canViewRequests,
    staleTime: 60000,
  });
  const pendingRequestCount = data?.summary?.totalPendingRequests || 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <Link
            href="/admin"
            className="flex items-center gap-2 font-extrabold"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
              <ShieldCheck className="size-5" />
            </span>
            <span>Admin</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <span className="ml-2 hidden text-sm font-medium sm:inline">
              {user?.name}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-3 shadow-card">
            <NavList user={user} pendingRequestCount={pendingRequestCount} logout={logout} />
          </div>
        </aside>
        {open && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <aside
              className="absolute left-0 top-0 h-full w-64 bg-card p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <NavList user={user} onNavigate={() => setOpen(false)} logout={logout} />
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
