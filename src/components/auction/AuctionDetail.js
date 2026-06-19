"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Heart, Flag, MapPin, ShieldCheck, Clock, MessageSquare, Gavel, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka, toBanglaDigits } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Countdown from "./Countdown";
import BidPanel from "./BidPanel";

export default function AuctionDetail({ id }) {
  const { t, locale } = useLanguage();
  const { isAuthed, user } = useAuth();
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["auction", id],
    queryFn: async () => (await api.get(`/auctions/${id}`)).data.data,
  });

  const watchMutation = useMutation({
    mutationFn: async () => (await api.post("/watchlist", { auctionId: id })).data.data,
    onSuccess: (d) => toast.success(d.watching ? (locale === "bn" ? "ওয়াচলিস্টে যোগ হয়েছে" : "Added to watchlist") : (locale === "bn" ? "সরানো হয়েছে" : "Removed")),
    onError: (e) => toast.error(e.message),
  });

  const contactSeller = useMutation({
    mutationFn: async () => (await api.post("/conversations", { recipientId: sellerId, auction: id })).data.data,
    onSuccess: (d) => router.push(`/dashboard/messages?c=${d.conversation._id}`),
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="grid place-items-center py-40"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }
  if (!data?.auction) {
    return <div className="py-40 text-center text-muted-foreground">{locale === "bn" ? "নিলাম পাওয়া যায়নি" : "Auction not found"}</div>;
  }

  const a = data.auction;
  const bids = data.bids || [];
  const images = a.images?.length ? a.images : [{ url: "/placeholder.svg" }];
  const sellerId = a.seller?._id || a.seller;
  const num = (n) => (locale === "bn" ? toBanglaDigits(n) : n);

  const report = async () => {
    if (!isAuthed) return router.push(`/login?next=/auctions/${id}`);
    const reason = prompt(locale === "bn" ? "রিপোর্টের কারণ (fraud/spam/counterfeit/abuse/other)" : "Reason (fraud/spam/counterfeit/abuse/other)");
    if (!reason) return;
    try {
      await api.post("/reports", { targetType: "auction", targetId: id, reason: "other", details: reason });
      toast.success(locale === "bn" ? "রিপোর্ট জমা হয়েছে" : "Report submitted");
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="container-tight py-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Gallery + description */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted">
            <Image src={images[activeImg].url} alt={a.title} fill sizes="(max-width:1024px) 100vw, 55vw" className="object-cover" priority />
            <div className="absolute left-3 top-3 flex gap-2">
              {a.isFeatured && <Badge variant="accent">{locale === "bn" ? "ফিচার্ড" : "Featured"}</Badge>}
              {a.reserveMet && <Badge variant="success">{locale === "bn" ? "রিজার্ভ পূরণ" : "Reserve met"}</Badge>}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((im, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}>
                  <Image src={im.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-2 font-bold">{locale === "bn" ? "বিবরণ" : "Description"}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{a.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge variant="muted">{locale === "bn" ? "অবস্থা" : "Condition"}: {a.condition}</Badge>
              <Badge variant="muted"><MapPin className="mr-1 size-3" /> {a.location}</Badge>
              {a.category?.name && <Badge variant="secondary">{a.category.name[locale] || a.category.name.en}</Badge>}
            </div>
          </div>

          {/* Bid history */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-bold"><Gavel className="size-4" /> {locale === "bn" ? "বিড ইতিহাস" : "Bid history"}</h2>
            {bids.length === 0 ? (
              <p className="text-sm text-muted-foreground">{locale === "bn" ? "এখনো কোনো বিড হয়নি। প্রথম হন!" : "No bids yet. Be the first!"}</p>
            ) : (
              <ul className="divide-y divide-border">
                {bids.map((b) => (
                  <li key={b._id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="flex items-center gap-2">
                      <Avatar className="size-7"><AvatarFallback>{b.bidder?.name?.[0] || "?"}</AvatarFallback></Avatar>
                      {b.bidder?.name || "Bidder"}
                      {b.type === "proxy" && <Badge variant="muted" className="text-[10px]">auto</Badge>}
                    </span>
                    <span className="font-bold text-primary">{formatTaka(b.amount, { locale })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sticky bidding sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">{a.title}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-accent">
              <Clock className="size-4" />
              <span className="text-muted-foreground">{t("common.endsIn")}:</span>
              <Countdown endDate={a.endDate} compact />
            </div>
          </div>

          <BidPanel auction={a} />

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => (isAuthed ? watchMutation.mutate() : router.push(`/login?next=/auctions/${id}`))} disabled={watchMutation.isPending}>
              <Heart className="size-4" /> {t("nav.watchlist")}
            </Button>
            <Button variant="outline" onClick={report}><Flag className="size-4" /> {locale === "bn" ? "রিপোর্ট" : "Report"}</Button>
          </div>

          {/* Seller */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">{locale === "bn" ? "বিক্রেতা" : "Seller"}</p>
            <div className="flex items-center gap-3">
              <Avatar className="size-11"><AvatarImage src={a.seller?.avatar} /><AvatarFallback>{a.seller?.name?.[0] || "S"}</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="flex items-center gap-1 font-semibold">
                  {a.seller?.name}
                  {a.seller?.isVerified && <ShieldCheck className="size-4 text-primary" />}
                </p>
                <p className="text-xs text-muted-foreground">{a.seller?.city || "Bangladesh"} · ⭐ {num(a.seller?.rating || 0)}</p>
              </div>
            </div>
            {(!user || String(user._id) !== String(sellerId)) && (
              <Button variant="secondary" className="mt-3 w-full" onClick={() => (isAuthed ? contactSeller.mutate() : router.push(`/login?next=/auctions/${id}`))} disabled={contactSeller.isPending}>
                <MessageSquare className="size-4" /> {locale === "bn" ? "বিক্রেতার সাথে যোগাযোগ" : "Contact seller"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
