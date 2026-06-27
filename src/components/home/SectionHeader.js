"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function SectionHeader({ title, subtitle, href, icon: Icon }) {
  const { t } = useLanguage();
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {Icon && <Icon className="size-5 text-accent" />}
          <span>{title}</span>
        </div>
        {subtitle && <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80">
          {t("common.viewAll")}
          <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
