"use client";
import { motion } from "framer-motion";
import { UserPlus, Gavel, Trophy } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function HowItWorks() {
  const { t } = useLanguage();
  const steps = [
    { icon: UserPlus, title: t("how.step1Title"), desc: t("how.step1Desc") },
    { icon: Gavel, title: t("how.step2Title"), desc: t("how.step2Desc") },
    { icon: Trophy, title: t("how.step3Title"), desc: t("how.step3Desc") },
  ];

  return (
    <section className="bg-muted/40 py-14">
      <div className="container-tight">
        <h2 className="mb-10 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
          {t("sections.howItWorks")}
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-6 text-center shadow-card"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-accent-foreground">
                {i + 1}
              </span>
              <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <s.icon className="size-7" />
              </span>
              <h3 className="mb-1.5 text-lg font-bold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
