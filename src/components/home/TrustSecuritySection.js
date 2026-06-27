"use client";
import { ShieldCheck, BadgeCheck, Lock, Sparkles, Clock, Eye } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const TRUST_CARDS = [
  { icon: BadgeCheck, titleKey: "trustSecurity.phoneVerifiedTitle", descKey: "trustSecurity.phoneVerifiedDesc" },
  { icon: ShieldCheck, titleKey: "trustSecurity.kycApprovedTitle", descKey: "trustSecurity.kycApprovedDesc" },
  { icon: Lock, titleKey: "trustSecurity.secureWalletTitle", descKey: "trustSecurity.secureWalletDesc" },
  { icon: Sparkles, titleKey: "trustSecurity.protectedTransactionsTitle", descKey: "trustSecurity.protectedTransactionsDesc" },
  { icon: Clock, titleKey: "trustSecurity.liveBiddingTitle", descKey: "trustSecurity.liveBiddingDesc" },
  { icon: Eye, titleKey: "trustSecurity.transparentSystemTitle", descKey: "trustSecurity.transparentSystemDesc" },
];

export default function TrustSecuritySection() {
  const { t } = useLanguage();

  return (
    <section className="w-full py-16 sm:py-20">
      <div className="container-tight">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[2rem] border border-border bg-card p-10 shadow-soft">
            <span className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              {t("trustSecurity.sectionLabel")}
            </span>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("trustSecurity.sectionHeadline")}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t("trustSecurity.sectionDescription")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {TRUST_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.titleKey} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{t(card.titleKey)}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(card.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
