"use client";
import { useEffect, useState } from "react";
import { timeLeft, pad2 } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toBanglaDigits } from "@/lib/currency";

/**
 * Live client-side countdown. Bidding is NOT realtime (per spec) — this is
 * a purely local ticker for urgency UX, not synced bid state.
 */
export default function Countdown({ endDate, compact = false, className = "" }) {
  const { locale, t } = useLanguage();
  const [tl, setTl] = useState(() => timeLeft(endDate));

  useEffect(() => {
    const id = setInterval(() => setTl(timeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const fmt = (n) => (locale === "bn" ? toBanglaDigits(pad2(n)) : pad2(n));

  if (tl.ended) {
    return <span className={`font-semibold text-muted-foreground ${className}`}>{t("common.ended")}</span>;
  }

  if (compact) {
    const label =
      tl.days > 0
        ? `${fmt(tl.days)}${t("common.days")} ${fmt(tl.hours)}${t("common.hours")}`
        : `${fmt(tl.hours)}:${fmt(tl.minutes)}:${fmt(tl.seconds)}`;
    return <span className={`tabular-nums font-semibold ${className}`}>{label}</span>;
  }

  const blocks = [
    { v: tl.days, l: t("common.days") },
    { v: tl.hours, l: t("common.hours") },
    { v: tl.minutes, l: t("common.mins") },
    { v: tl.seconds, l: t("common.secs") },
  ];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {blocks.map((b, i) => (
        <div key={i} className="flex min-w-[2.75rem] flex-col items-center rounded-md bg-foreground/5 px-2 py-1">
          <span className="text-base font-bold tabular-nums leading-none">{fmt(b.v)}</span>
          <span className="mt-0.5 text-[10px] uppercase text-muted-foreground">{b.l}</span>
        </div>
      ))}
    </div>
  );
}
