"use client";
import Link from "next/link";
import { Gavel, Facebook, Youtube, Instagram } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Footer() {
  const { t, locale } = useLanguage();
  const year = 2026;

  const cols = [
    {
      title: t("common.appName"),
      links: [
        { href: "/about", label: t("footer.about") },
        { href: "/contact", label: t("footer.contact") },
        { href: "/how-it-works", label: t("nav.howItWorks") },
      ],
    },
    {
      title: t("nav.categories"),
      links: [
        { href: "/auctions?category=mobile", label: locale === "bn" ? "মোবাইল" : "Mobile" },
        { href: "/auctions?category=cars", label: locale === "bn" ? "গাড়ি" : "Cars" },
        { href: "/auctions?category=electronics", label: locale === "bn" ? "ইলেকট্রনিক্স" : "Electronics" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { href: "/terms", label: t("footer.terms") },
        { href: "/privacy", label: t("footer.privacy") },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="container-tight grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Gavel className="size-5" />
            </span>
            {t("common.appName")}
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">{t("footer.description")}</p>
          <div className="flex gap-2 pt-1">
            {[Facebook, Youtube, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="social">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-bold">{col.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-foreground">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5">
        <p className="container-tight text-center text-xs text-muted-foreground">
          © {year} {t("common.appName")} — {t("footer.rights")} · 🇧🇩 Made for Bangladesh
        </p>
      </div>
    </footer>
  );
}
