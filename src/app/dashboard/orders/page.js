"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const { t, locale } = useLanguage();
  const [role, setRole] = useState("buyer");
  const { data, isLoading } = useQuery({
    queryKey: ["orders", role],
    queryFn: async () => (await api.get(`/orders?role=${role}`)).data.data.orders,
  });

  return (
    <div>
      <PageHeader title={t("nav.orders")} />
      <div className="mb-4 inline-flex rounded-lg border border-border bg-card p-1">
        {["buyer", "seller"].map((r) => (
          <button key={r} onClick={() => setRole(r)} className={cn("rounded-md px-4 py-1.5 text-sm font-medium", role === r ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
            {r === "buyer" ? (locale === "bn" ? "ক্রেতা" : "Buying") : (locale === "bn" ? "বিক্রেতা" : "Selling")}
          </button>
        ))}
      </div>
      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : !data?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <ShoppingBag className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{locale === "bn" ? "কোনো অর্ডার নেই।" : "No orders yet."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((o) => (
            <div key={o._id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">#{o.orderNumber}</span>
                <Badge variant="secondary">{o.status}</Badge>
              </div>
              <Link href={`/auctions/${o.auction?._id}`} className="mt-1 block font-semibold hover:text-primary">{o.auction?.title}</Link>
              <p className="mt-1 text-lg font-extrabold text-primary">{formatTaka(o.amount, { locale })}</p>
              <p className="text-xs text-muted-foreground">
                {role === "buyer" ? `${locale === "bn" ? "বিক্রেতা" : "Seller"}: ${o.seller?.name}` : `${locale === "bn" ? "ক্রেতা" : "Buyer"}: ${o.buyer?.name} · ${o.buyer?.phone || ""}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
