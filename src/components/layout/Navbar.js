"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gavel, Search, Menu, X, LayoutDashboard, Heart, Bell, MessageSquare, LogOut, User, ShieldCheck, Plus } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/common/ThemeToggle";
import LanguageToggle from "@/components/common/LanguageToggle";

export default function Navbar() {
  const { t } = useLanguage();
  const { isAuthed, isAdmin, user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    router.push(`/auctions?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };

  const navLinks = [
    { href: "/auctions", label: t("nav.auctions") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/how-it-works", label: t("nav.howItWorks") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="container-tight flex h-16 items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg shrink-0">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Gavel className="size-5" />
          </span>
          <span className="hidden sm:inline">{t("common.appName")}</span>
        </Link>

        {/* Search (desktop) */}
        <form onSubmit={onSearch} className="relative hidden flex-1 md:block max-w-md mx-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("common.searchPlaceholder")}
            className="pl-9"
          />
        </form>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />

          <Button asChild variant="accent" size="sm" className="hidden sm:inline-flex">
            <Link href="/dashboard/auctions/new">
              <Plus className="size-4" /> {t("nav.sell")}
            </Link>
          </Button>

          {isAuthed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard"><LayoutDashboard /> {t("nav.dashboard")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/bids"><Gavel /> {t("nav.myBids")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/watchlist"><Heart /> {t("nav.watchlist")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/messages"><MessageSquare /> {t("nav.messages")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/notifications"><Bell /> {t("nav.notifications")}</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin"><ShieldCheck /> {t("nav.admin")}</Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10">
                  <LogOut /> {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">{t("nav.register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((o) => !o)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-tight space-y-3 py-4">
            <form onSubmit={onSearch} className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.searchPlaceholder")} className="pl-9" />
            </form>
            <nav className="grid gap-1">
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 font-medium hover:bg-muted">
                  {l.label}
                </Link>
              ))}
              <Link href="/dashboard/auctions/new" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 font-medium text-accent hover:bg-muted">
                {t("nav.sell")}
              </Link>
            </nav>
            {!isAuthed && (
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline"><Link href="/login" onClick={() => setOpen(false)}>{t("nav.login")}</Link></Button>
                <Button asChild><Link href="/register" onClick={() => setOpen(false)}>{t("nav.register")}</Link></Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
