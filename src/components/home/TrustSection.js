"use client";
import { motion } from "framer-motion";
import { BadgeCheck, ShieldCheck, Eye } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function TrustSection() {
  const { t } = useLanguage();
  const items = [
    { icon: BadgeCheck, title: t("trust.verifiedTitle"), desc: t("trust.verifiedDesc") },
    { icon: ShieldCheck, title: t("trust.secureTitle"), desc: t("trust.secureDesc") },
    { icon: Eye, title: t("trust.transparentTitle"), desc: t("trust.transparentDesc") },
  ];
  return (
    <section className="container-tight py-14">
      <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
        {t("sections.trust")}
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent p-6 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
              <it.icon className="size-7" />
            </span>
            <h3 className="text-lg font-bold">{it.title}</h3>
            <p className="text-sm text-muted-foreground">{it.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
