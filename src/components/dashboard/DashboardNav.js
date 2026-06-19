"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Gavel, Plus, Heart, ShoppingBag, MessageSquare,
  Bell, User, FileText, ShieldCheck, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";

export default function DashboardNav({ onNavigate }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const items = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, exact: true },
    { href: "/dashboard/auctions", label: t("nav.myAuctions"), icon: Gavel },
    { href: "/dashboard/auctions/new", label: t("nav.sell"), icon: Plus },
    { href: "/dashboard/bids", label: t("nav.myBids"), icon: Gavel },
    { href: "/dashboard/watchlist", label: t("nav.watchlist"), icon: Heart },
    { href: "/dashboard/orders", label: t("nav.orders"), icon: ShoppingBag },
    { href: "/dashboard/messages", label: t("nav.messages"), icon: MessageSquare },
    { href: "/dashboard/notifications", label: t("nav.notifications"), icon: Bell },
    { href: "/dashboard/requests", label: "Requests", icon: FileText },
    { href: "/dashboard/profile", label: t("nav.profile"), icon: User },
  ];

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item)
              ? "bg-primary text-primary-foreground shadow-soft"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="size-4.5 shrink-0" />
          {item.label}
        </Link>
      ))}

      {isAdmin && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="mt-2 flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2.5 text-sm font-semibold text-accent"
        >
          <ShieldCheck className="size-4.5" /> {t("nav.admin")}
        </Link>
      )}
      <Link
        href="/"
        onClick={onNavigate}
        className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
      >
        <Home className="size-4.5" /> {t("nav.home")}
      </Link>
    </nav>
  );
}
