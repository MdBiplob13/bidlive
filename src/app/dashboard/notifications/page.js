"use client";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { t, locale } = useLanguage();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => (await api.get("/notifications")).data.data,
  });

  const markAll = useMutation({
    mutationFn: async () => api.patch("/notifications", {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markOne = useMutation({
    mutationFn: async (id) => api.patch("/notifications", { id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items = data?.items || [];

  return (
    <div>
      <PageHeader
        title={t("nav.notifications")}
        action={items.some((n) => !n.isRead) && <Button variant="outline" size="sm" onClick={() => markAll.mutate()}><CheckCheck className="size-4" /> {locale === "bn" ? "সব পঠিত" : "Mark all read"}</Button>}
      />
      {isLoading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : !items.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Bell className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{locale === "bn" ? "কোনো নোটিফিকেশন নেই।" : "No notifications."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Link
              key={n._id}
              href={n.link || "#"}
              onClick={() => !n.isRead && markOne.mutate(n._id)}
              className={cn("flex gap-3 rounded-xl border border-border p-4 transition-colors", n.isRead ? "bg-card" : "bg-primary/5 border-primary/20")}
            >
              <div className={cn("mt-0.5 size-2 shrink-0 rounded-full", n.isRead ? "bg-transparent" : "bg-primary")} />
              <div className="min-w-0">
                <p className="font-semibold">{n.title?.[locale] || n.title?.en}</p>
                <p className="text-sm text-muted-foreground">{n.body?.[locale] || n.body?.en}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
