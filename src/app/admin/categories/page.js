"use client";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import api from "@/lib/api";
import { slugify } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();
  const { data } = useQuery({ queryKey: ["categories"], queryFn: async () => (await api.get("/categories")).data.data.categories });

  const create = useMutation({
    mutationFn: async (v) => api.post("/categories", { slug: slugify(v.en), name: { en: v.en, bn: v.bn }, icon: v.icon || "package" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category added"); reset(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      <PageHeader title="Categories" />
      <form onSubmit={handleSubmit((v) => create.mutate(v))} className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-5 shadow-card sm:grid-cols-3">
        <div className="space-y-1.5"><Label>English name</Label><Input {...register("en", { required: true })} placeholder="Mobiles" /></div>
        <div className="space-y-1.5"><Label>Bangla name</Label><Input {...register("bn", { required: true })} placeholder="মোবাইল" /></div>
        <div className="space-y-1.5"><Label>Icon (lucide)</Label><Input {...register("icon")} placeholder="smartphone" /></div>
        <div className="sm:col-span-3"><Button type="submit"><Plus className="size-4" /> Add category</Button></div>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data?.map((c) => (
          <div key={c._id} className="rounded-xl border border-border bg-card p-4 text-center shadow-card">
            <p className="font-semibold">{c.name.bn}</p>
            <p className="text-sm text-muted-foreground">{c.name.en}</p>
            <p className="mt-1 text-xs text-muted-foreground">/{c.slug}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
