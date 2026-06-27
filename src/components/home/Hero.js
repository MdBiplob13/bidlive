"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gavel, Plus, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero-mesh relative overflow-hidden bg-background/95 py-20 sm:py-24 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-background/95 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/95 to-transparent" />
      <div className="container-tight">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.95fr] lg:items-center">
          <div className="space-y-8 max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary shadow-soft"
            >
              {t("hero.badge")}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              {t("hero.title")} <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t("hero.titleAccent")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Button asChild size="lg">
                <Link href="/auctions"><Gavel /> {t("hero.startBidding")}</Link>
              </Button>
              <Button asChild size="lg" variant="accent">
                <Link href="/dashboard/auctions/new"><Plus /> {t("hero.sellItem")}</Link>
              </Button>
            </motion.div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-soft">
                <ShieldCheck className="size-5 text-primary" />
                <span>{t("trust.secureTitle")}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-soft">
                <TrendingUp className="size-5 text-accent" />
                <span>{t("trust.transparentTitle")}</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-soft">
              <div className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{t("hero.marketplacePulse")}</p>
                  <h3 className="mt-4 text-2xl font-bold text-foreground">{t("hero.pulseHeadline")}</h3>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-accent">{t("hero.liveLabel")}</span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.75rem] border border-border bg-background p-5 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">{t("hero.activeBids")}</p>
                  <p className="mt-3 text-2xl font-extrabold text-foreground">1.2k</p>
                </div>
                <div className="rounded-[1.75rem] border border-border bg-background p-5 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">{t("hero.topAuctions")}</p>
                  <p className="mt-3 text-2xl font-extrabold text-foreground">320</p>
                </div>
                <div className="rounded-[1.75rem] border border-border bg-background p-5 text-center">
                  <p className="text-sm font-semibold text-muted-foreground">{t("hero.bidsPerHour")}</p>
                  <p className="mt-3 text-2xl font-extrabold text-foreground">2.4k</p>
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-border/80 bg-background p-5">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  <span>{t("hero.bidVolume")}</span>
                  <span className="text-foreground/70">+18%</span>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {[10, 14, 8, 16, 12].map((height, idx) => (
                    <div key={idx} className="overflow-hidden rounded-full bg-muted">
                      <div className="h-14 rounded-full bg-primary" style={{ height: `${height}px` }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-4">
                  <Users className="size-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{t("hero.verifiedUsers")}</p>
                    <p className="text-xs text-muted-foreground">{t("hero.verifiedUsersDesc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted px-4 py-4">
                  <ShieldCheck className="size-5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">{t("hero.secureWallet")}</p>
                    <p className="text-xs text-muted-foreground">{t("hero.secureWalletDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
