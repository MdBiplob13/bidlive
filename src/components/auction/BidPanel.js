"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Gavel, Zap, Loader2, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka, bidIncrement } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BidPanel({ auction }) {
  const { isAuthed, user } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const qc = useQueryClient();

  const current = auction.currentBid > 0 ? auction.currentBid : auction.startingPrice;
  const step = auction.bidIncrement || bidIncrement(current);
  const minNext = auction.currentBid > 0 ? current + step : auction.startingPrice;

  const [amount, setAmount] = useState(minNext);
  const [autoBid, setAutoBid] = useState(false);
  const [maxAutoBid, setMaxAutoBid] = useState("");

  const isSeller = user && String(user._id) === String(auction.seller?._id || auction.seller);
  const ended = new Date(auction.endDate).getTime() <= Date.now() || auction.status !== "active";

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { amount: Number(amount) };
      if (autoBid && maxAutoBid) body.maxAutoBid = Number(maxAutoBid);
      const res = await api.post(`/auctions/${auction._id}/bid`, body);
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.youAreLeading) toast.success(locale === "bn" ? "আপনি এখন এগিয়ে! 🎉" : "You're leading! 🎉");
      else toast(locale === "bn" ? "বিড হয়েছে, কিন্তু আপনি পিছিয়ে।" : "Bid placed, but you've been outbid.", { icon: "⚠️" });
      qc.invalidateQueries({ queryKey: ["auction", auction._id] });
      router.refresh();
    },
    onError: (e) => toast.error(e.message),
  });

  if (ended) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <p className="text-sm text-muted-foreground">{t("common.currentBid")}</p>
        <p className="text-3xl font-extrabold text-primary">{formatTaka(current, { locale })}</p>
        <div className="mt-4 rounded-lg bg-muted p-3 text-center text-sm font-semibold">
          {auction.status === "sold"
            ? (locale === "bn" ? "বিক্রি হয়ে গেছে" : "This item has been sold")
            : (locale === "bn" ? "নিলাম শেষ হয়েছে" : "This auction has ended")}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("common.currentBid")}</p>
          <p className="text-3xl font-extrabold text-primary">{formatTaka(current, { locale })}</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {auction.bidCount || 0} {t("common.bids")}
        </p>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {locale === "bn" ? "সর্বনিম্ন পরবর্তী বিড" : "Min. next bid"}: {formatTaka(minNext, { locale })}
      </p>

      {isSeller ? (
        <div className="mt-4 rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
          {locale === "bn" ? "এটি আপনার নিজের নিলাম" : "This is your own auction"}
        </div>
      ) : !isAuthed ? (
        <Button className="mt-4 w-full" size="lg" onClick={() => router.push(`/login?next=/auctions/${auction._id}`)}>
          {locale === "bn" ? "বিড করতে লগইন করুন" : "Login to bid"}
        </Button>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="amount">{t("common.placeBid")} (৳)</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => setAmount((a) => Math.max(minNext, Number(a) - step))}>−</Button>
              <Input id="amount" type="number" min={minNext} step={step} value={amount} onChange={(e) => setAmount(e.target.value)} className="text-center font-bold" />
              <Button type="button" variant="outline" size="icon" onClick={() => setAmount((a) => Number(a) + step)}>+</Button>
            </div>
          </div>

          <button type="button" onClick={() => setAutoBid((v) => !v)} className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
            <span className="flex items-center gap-2 font-medium"><Zap className="size-4 text-accent" /> {locale === "bn" ? "অটো-বিড" : "Auto-bid"}</span>
            <span className={`relative h-5 w-9 rounded-full transition-colors ${autoBid ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 size-4 rounded-full bg-white transition-transform ${autoBid ? "translate-x-4" : "translate-x-0.5"}`} />
            </span>
          </button>

          {autoBid && (
            <div className="space-y-1.5">
              <Label htmlFor="maxAutoBid">{locale === "bn" ? "সর্বোচ্চ সীমা" : "Maximum limit"} (৳)</Label>
              <Input id="maxAutoBid" type="number" min={minNext} value={maxAutoBid} onChange={(e) => setMaxAutoBid(e.target.value)} placeholder={String(minNext + step * 10)} />
              <p className="text-xs text-muted-foreground">
                {locale === "bn"
                  ? "সিস্টেম স্বয়ংক্রিয়ভাবে এই সীমা পর্যন্ত বিড বাড়াবে।"
                  : "We'll automatically bid up to this limit on your behalf."}
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Gavel className="size-4" />}
            {t("common.placeBid")}
            <ChevronRight className="size-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
