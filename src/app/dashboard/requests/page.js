"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CATEGORIES = ["mobile", "cars", "bikes", "electronics", "land", "fashion", "furniture"];

export default function RequestsPage() {
  const router = useRouter();
  const { locale } = useLanguage();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <h1 className="mb-4 text-2xl font-semibold">{locale === "bn" ? "পেইজ বিদ্যমান নেই" : "Page unavailable"}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {locale === "bn"
            ? "ব্যবহারকারীদের আর রিকোয়েস্ট পোস্ট করার অপশন নেই। বেড়াতে, নিলামে অংশগ্রহণ করুন বা KYC পূরণ করুন।"
            : "User requests are no longer available. Browse auctions, participate in bidding, or complete your KYC instead."}
        </p>
        <Button asChild><Link href="/dashboard">{locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Go back to dashboard"}</Link></Button>
      </div>
    </div>
  );
}
