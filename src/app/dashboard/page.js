"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Gavel, Heart, Bell, Plus, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/dashboard/PageHeader";

function StatCard({ icon: Icon, label, value, href, color }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
      <div className={`mb-3 grid size-10 place-items-center rounded-lg ${color}`}><Icon className="size-5" /></div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();

  const { data: bids } = useQuery({ queryKey: ["me", "bids"], queryFn: async () => (await api.get("/me/bids")).data.data.items });
  const { data: watch } = useQuery({ queryKey: ["watchlist"], queryFn: async () => (await api.get("/watchlist")).data.data.items });
  const { data: notifs } = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get("/notifications")).data.data });
  const { data: leaderboard } = useQuery({ queryKey: ["leaderboard"], queryFn: async () => (await api.get("/leaderboard")).data.data.items });

  return (
    <div>
      <PageHeader
        title={`${locale === "bn" ? "স্বাগতম" : "Welcome"}, ${user?.name || ""} 👋`}
        subtitle={locale === "bn" ? "আপনার নিলাম কার্যক্রম এক নজরে" : "Your auction activity at a glance"}
        action={<Button asChild><Link href="/dashboard/auctions/new"><Plus className="size-4" /> {t("nav.sell")}</Link></Button>}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Gavel} label={t("nav.myBids")} value={bids?.length ?? "—"} href="/dashboard/bids" color="bg-primary/10 text-primary" />
        <StatCard icon={Heart} label={t("nav.watchlist")} value={watch?.length ?? "—"} href="/dashboard/watchlist" color="bg-accent/10 text-accent" />
        <StatCard icon={Bell} label={t("nav.notifications")} value={notifs?.unread ?? "—"} href="/dashboard/notifications" color="bg-destructive/10 text-destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-3 flex items-center gap-2 font-bold"><TrendingUp className="size-5 text-primary" /> {locale === "bn" ? "এগিয়ে থাকা বিড" : "Bids you're leading"}</h2>
          {bids?.filter((b) => b.leading)?.length ? (
            <ul className="divide-y divide-border">
              {bids.filter((b) => b.leading).slice(0, 5).map((b) => (
                <li key={b.auction._id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href={`/auctions/${b.auction._id}`} className="font-medium hover:text-primary">{b.auction.title}</Link>
                  <span className="font-bold text-success">৳{b.myMax}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">{locale === "bn" ? "এখনো কোনো এগিয়ে থাকা বিড নেই।" : "You're not leading any auctions yet."}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-3 flex items-center gap-2 font-bold"><TrendingUp className="size-5 text-primary" /> {locale === "bn" ? "বিডার র‌্যাঙ্কিং" : "Bidder Rankings"}</h2>
          {leaderboard?.length ? (
            <ol className="space-y-2">
              {leaderboard.map((item, index) => (
                <li key={item._id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-semibold">{index + 1}. {item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.totalBids} bids · ৳{item.totalAmount}</p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.rank}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">{locale === "bn" ? "কোনো বিডার তথ্য পাওয়া যায়নি।" : "No bidder ranking data available."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
