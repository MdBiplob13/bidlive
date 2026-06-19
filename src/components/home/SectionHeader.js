"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function SectionHeader({ title, subtitle, href, icon: Icon }) {
  const { t } = useLanguage();
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
          {Icon && <Icon className="size-6 text-accent" />}
          {title}
        </h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
          {t("common.viewAll")}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
