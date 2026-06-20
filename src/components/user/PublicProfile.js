"use client";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Star, Calendar, Package, Gavel, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toBanglaDigits } from "@/lib/currency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AuctionCard from "@/components/auction/AuctionCard";

export default function PublicProfile({ id }) {
  const { locale } = useLanguage();
  const num = (n) => (locale === "bn" ? toBanglaDigits(n) : n);

  const { data, isLoading } = useQuery({
    queryKey: ["public-user", id],
    queryFn: async () => (await api.get(`/users/${id}`)).data.data,
  });

  const { data: auctionData, isLoading: loadingAuctions } = useQuery({
    queryKey: ["public-user-auctions", id],
    queryFn: async () => (await api.get(`/auctions?seller=${id}&status=active&limit=24`)).data.data,
  });

  if (isLoading) {
    return <div className="grid place-items-center py-40"><Loader2 className="size-8 animate-spin text-primary" /></div>;
  }
  if (!data?.user) {
    return <div className="py-40 text-center text-muted-foreground">{locale === "bn" ? "ব্যবহারকারী পাওয়া যায়নি" : "User not found"}</div>;
  }

  const u = data.user;
  const auctions = auctionData?.auctions || [];
  const memberSince = u.createdAt
    ? new Date(u.createdAt).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="container-tight py-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-card sm:flex-row sm:items-center sm:text-left">
        <Avatar className="size-24">
          <AvatarImage src={u.avatar} alt={u.name} />
          <AvatarFallback className="text-3xl">{u.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-extrabold sm:justify-start">
            {u.name}
            {u.isVerified && <ShieldCheck className="size-5 text-primary" />}
            {u.role === "admin" && <Badge variant="accent">Admin</Badge>}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
            {u.city && <span>{u.city}</span>}
            <span className="flex items-center gap-1"><Star className="size-4 text-amber-400" /> {num(u.rating || 0)} ({num(u.ratingCount || 0)})</span>
            {memberSince && <span className="flex items-center gap-1"><Calendar className="size-4" /> {locale === "bn" ? "সদস্য" : "Member since"} {memberSince}</span>}
            <span className="flex items-center gap-1"><Package className="size-4" /> {num(data.activeListings || 0)} {locale === "bn" ? "সক্রিয় নিলাম" : "active listings"}</span>
          </div>
        </div>
      </div>

      {/* Active listings */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Gavel className="size-5 text-primary" /> {locale === "bn" ? "সক্রিয় নিলাম" : "Active auctions"}
        </h2>
        {loadingAuctions ? (
          <div className="grid place-items-center py-16"><Loader2 className="size-7 animate-spin text-primary" /></div>
        ) : !auctions.length ? (
          <p className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {locale === "bn" ? "কোনো সক্রিয় নিলাম নেই" : "No active auctions"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {auctions.map((a, i) => <AuctionCard key={a._id} auction={a} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
