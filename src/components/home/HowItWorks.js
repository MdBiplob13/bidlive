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
    <section className="bg-muted/50 py-16 sm:py-20">
      <div className="container-tight">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t("sections.howItWorks")}</h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-soft transition hover:-translate-y-1"
            >
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
                <s.icon className="size-7" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
