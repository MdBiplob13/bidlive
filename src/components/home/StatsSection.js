"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, Gavel, TrendingUp, PackageCheck } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toBanglaDigits } from "@/lib/currency";

function Counter({ to, locale }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  const formatted = n.toLocaleString("en-US");
  return <span ref={ref}>{locale === "bn" ? toBanglaDigits(formatted) : formatted}+</span>;
}

export default function StatsSection({ stats }) {
  const { t, locale } = useLanguage();
  const data = [
    { icon: Users, value: stats?.users ?? 12500, label: t("stats.users") },
    { icon: Gavel, value: stats?.auctions ?? 8400, label: t("stats.auctions") },
    { icon: TrendingUp, value: stats?.bids ?? 96000, label: t("stats.bids") },
    { icon: PackageCheck, value: stats?.sold ?? 5200, label: t("stats.sold") },
  ];

  return (
    <section className="bg-primary/5 py-16 sm:py-20">
      <div className="container-tight">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-soft"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
                <d.icon className="size-7" />
              </div>
              <span className="mt-4 block text-3xl font-extrabold tabular-nums sm:text-4xl">
                <Counter to={d.value} locale={locale} />
              </span>
              <span className="mt-2 block text-sm text-muted-foreground">{d.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
