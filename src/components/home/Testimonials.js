"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Testimonials({ items = [] }) {
  const { t, locale } = useLanguage();
  if (!items.length) return null;

  return (
    <section className="container-tight py-14">
      <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        {t("sections.testimonials")}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((it, i) => (
          <motion.figure
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <Quote className="mb-3 size-7 text-accent/40" />
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={`size-4 ${s < it.rating ? "fill-accent text-accent" : "text-muted"}`} />
              ))}
            </div>
            <blockquote className="text-sm text-foreground/90">“{it.text[locale] || it.text.en}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                {it.name[0]}
              </span>
              <div>
                <p className="text-sm font-semibold">{it.name}</p>
                <p className="text-xs text-muted-foreground">{it.city}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
