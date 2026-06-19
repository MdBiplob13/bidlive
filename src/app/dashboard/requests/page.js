"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FileText, Plus, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatTaka } from "@/lib/currency";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["mobile", "cars", "bikes", "electronics", "land", "fashion", "furniture"];

export default function RequestsPage() {
  const { locale } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const { data } = useQuery({ queryKey: ["requests", "mine"], queryFn: async () => (await api.get("/requests?scope=mine")).data.data.requests });

  const create = useMutation({
    mutationFn: async (values) => api.post("/requests", values),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["requests", "mine"] }); toast.success(locale === "bn" ? "রিকোয়েস্ট জমা হয়েছে" : "Request posted"); reset(); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={locale === "bn" ? "আমার রিকোয়েস্ট" : "My Requests"}
        subtitle={locale === "bn" ? "যা খুঁজছেন তা পোস্ট করুন, বিক্রেতারা সাড়া দেবেন" : "Post what you're looking for; sellers respond"}
        action={<Button onClick={() => setShowForm((s) => !s)}><Plus className="size-4" /> {locale === "bn" ? "নতুন" : "New"}</Button>}
      />

      {showForm && (
        <form onSubmit={handleSubmit((v) => create.mutate(v))} className="mb-6 space-y-3 rounded-xl border border-border bg-card p-5 shadow-card">
          <div className="space-y-1.5"><Label>{locale === "bn" ? "শিরোনাম" : "Title"}</Label><Input {...register("title", { required: true })} /></div>
          <div className="space-y-1.5"><Label>{locale === "bn" ? "বিবরণ" : "Description"}</Label><Textarea rows={3} {...register("description", { required: true })} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Select {...register("category", { required: true })} defaultValue=""><option value="" disabled>Category</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</Select>
            <Input type="number" placeholder={locale === "bn" ? "সর্বনিম্ন বাজেট" : "Min budget"} {...register("budgetMin")} />
            <Input type="number" placeholder={locale === "bn" ? "সর্বোচ্চ বাজেট" : "Max budget"} {...register("budgetMax")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="size-4 animate-spin" />} {locale === "bn" ? "জমা দিন" : "Submit"}</Button>
        </form>
      )}

      {!data?.length ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <FileText className="size-10 text-muted-foreground" />
          <p className="text-muted-foreground">{locale === "bn" ? "কোনো রিকোয়েস্ট নেই।" : "No requests yet."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((r) => (
            <div key={r._id} className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.title}</p>
                <Badge variant="secondary">{r.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
              {(r.budgetMin || r.budgetMax) > 0 && (
                <p className="mt-1 text-sm font-medium text-primary">{formatTaka(r.budgetMin, { locale })} – {formatTaka(r.budgetMax, { locale })}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
