"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrdersPage() {
  const router = useRouter();
  const { locale } = useLanguage();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-20">
      <div className="max-w-xl rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <h1 className="mb-4 text-2xl font-semibold">{locale === "bn" ? "অর্ডার ফাংশন সরানো হয়েছে" : "Order feature removed"}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {locale === "bn"
            ? "অর্ডার প্রক্রিয়া আর ব্যবহারকারীর জন্য উপলব্ধ নেই। নিলামে অংশগ্রহণ করুন বা আপনার KYC সম্পন্ন করুন।"
            : "The order workflow is no longer available for users. Participate in auctions or complete your KYC instead."}
        </p>
        <Button asChild><Link href="/dashboard">{locale === "bn" ? "ড্যাশবোর্ডে ফিরে যান" : "Go back to dashboard"}</Link></Button>
      </div>
    </div>
  );
}
