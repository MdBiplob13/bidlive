"use client";
import { useState } from "react";
import Link from "next/link";
import { Gavel, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";
import DashboardNav from "./DashboardNav";

export default function DashboardShell({ children, admin = false }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2 font-extrabold">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Gavel className="size-5" /></span>
            <span className="hidden sm:inline">{t("common.appName")}</span>
            {admin && <span className="rounded bg-accent px-1.5 py-0.5 text-xs text-accent-foreground">Admin</span>}
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Avatar className="ml-1"><AvatarImage src={user?.avatar} /><AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback></Avatar>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar (desktop) */}
        {!admin && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-3 shadow-card">
              <DashboardNav />
              <button onClick={logout} className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10">
                {t("nav.logout")}
              </button>
            </div>
          </aside>
        )}

        {/* Mobile drawer */}
        {open && !admin && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <aside className="absolute left-0 top-0 h-full w-72 bg-card p-4 shadow-soft" onClick={(e) => e.stopPropagation()}>
              <DashboardNav onNavigate={() => setOpen(false)} />
              <button onClick={logout} className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-destructive/10">
                {t("nav.logout")}
              </button>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
