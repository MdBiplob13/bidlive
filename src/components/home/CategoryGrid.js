"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Car, Bike, Laptop, MapPin, Shirt, Sofa, Package } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import SectionHeader from "./SectionHeader";

const ICONS = { smartphone: Smartphone, car: Car, bike: Bike, laptop: Laptop, "map-pin": MapPin, shirt: Shirt, sofa: Sofa, package: Package };

export default function CategoryGrid({ categories = [] }) {
  const { t, locale } = useLanguage();
  if (!categories.length) return null;

  return (
    <section className="w-full py-16 sm:py-20">
      <div className="container-tight">
        <SectionHeader title={t("sections.categories")} subtitle={t("sections.categoriesSub")} href="/categories" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {categories.map((c, i) => {
            const Icon = ICONS[c.icon] || Package;
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <Link
                  href={`/auctions?category=${c.slug}`}
                  className="group flex flex-col items-center gap-4 rounded-[2rem] border border-border bg-card p-6 text-center shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
                >
                  <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-7" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{c.name[locale] || c.name.en}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
