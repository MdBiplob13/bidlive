"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import SiteShell from "@/components/layout/SiteShell";
import AuctionCard from "@/components/auction/AuctionCard";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { slug: "", label: { en: "All categories", bn: "সব ক্যাটাগরি" } },
  { slug: "mobile", label: { en: "Mobiles", bn: "মোবাইল" } },
  { slug: "cars", label: { en: "Cars", bn: "গাড়ি" } },
  { slug: "bikes", label: { en: "Bikes", bn: "বাইক" } },
  { slug: "electronics", label: { en: "Electronics", bn: "ইলেকট্রনিক্স" } },
  { slug: "land", label: { en: "Land", bn: "জমি" } },
  { slug: "fashion", label: { en: "Fashion", bn: "ফ্যাশন" } },
  { slug: "furniture", label: { en: "Furniture", bn: "আসবাবপত্র" } },
];

function AuctionsBrowser() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");

  const category = sp.get("category") || "";
  const sort = sp.get("sort") || "newest";

  const updateParam = (key, value) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/auctions?${params.toString()}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["auctions", { q: sp.get("q"), category, sort }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sp.get("q")) params.set("q", sp.get("q"));
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      params.set("limit", "24");
      const res = await api.get(`/auctions?${params.toString()}`);
      return res.data.data;
    },
  });

  const auctions = data?.auctions || [];

  return (
    <div className="container-tight py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{t("nav.auctions")}</h1>
        <p className="text-sm text-muted-foreground">
          {data?.total ?? "…"} {locale === "bn" ? "টি নিলাম" : "auctions"}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); updateParam("q", q.trim()); }}
          className="relative flex-1"
        >
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("common.searchPlaceholder")} className="pl-9" />
        </form>
        <Select value={category} onChange={(e) => updateParam("category", e.target.value)} className="sm:w-44">
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label[locale]}</option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="sm:w-44">
          <option value="newest">{locale === "bn" ? "নতুন" : "Newest"}</option>
          <option value="ending">{locale === "bn" ? "শীঘ্রই শেষ" : "Ending soon"}</option>
          <option value="trending">{locale === "bn" ? "জনপ্রিয়" : "Trending"}</option>
          <option value="price_low">{locale === "bn" ? "কম দাম" : "Price: low"}</option>
          <option value="price_high">{locale === "bn" ? "বেশি দাম" : "Price: high"}</option>
          <option value="most_bids">{locale === "bn" ? "বেশি বিড" : "Most bids"}</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
          <SlidersHorizontal className="size-10 text-muted-foreground" />
          <p className="font-semibold">{locale === "bn" ? "কোনো নিলাম পাওয়া যায়নি" : "No auctions found"}</p>
          <Button variant="outline" onClick={() => router.push("/auctions")}>{t("common.all")}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {auctions.map((a, i) => (
            <AuctionCard key={a._id} auction={a} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AuctionsPage() {
  return (
    <SiteShell>
      <Suspense fallback={<div className="grid place-items-center py-40"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
        <AuctionsBrowser />
      </Suspense>
    </SiteShell>
  );
}
