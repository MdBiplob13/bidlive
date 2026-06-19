"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone, Car, Bike, Laptop, MapPin, Shirt, Sofa, Package,
} from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import SectionHeader from "./SectionHeader";

const ICONS = { smartphone: Smartphone, car: Car, bike: Bike, laptop: Laptop, "map-pin": MapPin, shirt: Shirt, sofa: Sofa, package: Package };

export default function CategoryGrid({ categories = [] }) {
  const { t, locale } = useLanguage();
  if (!categories.length) return null;

  return (
    <section className="container-tight py-10 sm:py-12">
      <SectionHeader title={t("sections.categories")} subtitle={t("sections.categoriesSub")} href="/categories" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {categories.map((c, i) => {
          const Icon = ICONS[c.icon] || Package;
          return (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <Link
                href={`/auctions?category=${c.slug}`}
                className="group flex flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4 text-center shadow-card transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft"
              >
                <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-6" />
                </span>
                <span className="text-xs font-semibold sm:text-sm">{c.name[locale] || c.name.en}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
