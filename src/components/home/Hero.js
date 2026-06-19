"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gavel, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero-mesh relative overflow-hidden">
      <div className="container-tight grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
        <div className="space-y-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
          >
            {t("hero.badge")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            {t("hero.title")}{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("hero.titleAccent")}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link href="/auctions"><Gavel /> {t("hero.startBidding")}</Link>
            </Button>
            <Button asChild size="lg" variant="accent">
              <Link href="/dashboard/auctions/new"><Plus /> {t("hero.sellItem")}</Link>
            </Button>
          </motion.div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary" /> {t("trust.secureTitle")}</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="size-4 text-accent" /> {t("trust.transparentTitle")}</span>
          </div>
        </div>

        {/* Floating preview cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative mx-auto grid max-w-md grid-cols-2 gap-4">
            {[
              { t: "iPhone 15 Pro", p: "৳১,৪২,৫০০", c: "from-primary/15" },
              { t: "Toyota Axio", p: "৳১৮,২০,০০০", c: "from-accent/15" },
              { t: "Yamaha R15", p: "৳৩,৯৮,০০০", c: "from-accent/15" },
              { t: "MacBook Air M2", p: "৳১,১২,০০০", c: "from-primary/15" },
            ].map((card, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, i % 2 ? 8 : -8, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
                className={`rounded-2xl border border-border bg-gradient-to-br ${card.c} to-card p-4 shadow-soft backdrop-blur`}
              >
                <div className="mb-3 aspect-video rounded-lg bg-foreground/5" />
                <p className="text-sm font-semibold">{card.t}</p>
                <p className="text-lg font-extrabold text-primary">{card.p}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
