"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Gavel, Flag, FileText, ScrollText,
  ShieldCheck, Menu, X, Home, Tags, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/auctions", label: "Auctions", icon: Gavel },
  { href: "/admin/bids", label: "Bids", icon: TrendingUp },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/requests", label: "Requests", icon: FileText },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
];

function NavList({ onNavigate }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate}
            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
            <item.icon className="size-4.5" /> {item.label}
          </Link>
        );
      })}
      <Link href="/" onClick={onNavigate} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
        <Home className="size-4.5" /> Back to site
      </Link>
    </nav>
  );
}

export default function AdminShell({ children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <Link href="/admin" className="flex items-center gap-2 font-extrabold">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><ShieldCheck className="size-5" /></span>
            <span>Admin</span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <LanguageToggle /><ThemeToggle />
            <span className="ml-2 hidden text-sm font-medium sm:inline">{user?.name}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-3 shadow-card"><NavList /></div>
        </aside>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <aside className="absolute left-0 top-0 h-full w-64 bg-card p-4" onClick={(e) => e.stopPropagation()}>
              <NavList onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
