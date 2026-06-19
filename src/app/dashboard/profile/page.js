"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { maskPhone } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { t, locale } = useLanguage();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email, city: user.city, address: user.address });
  }, [user, reset]);

  const onSubmit = async (values) => {
    try {
      await api.patch("/me", values);
      await refresh();
      toast.success(locale === "bn" ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated");
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="max-w-xl">
      <PageHeader title={t("nav.profile")} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="space-y-1.5">
          <Label>{t("auth.phone")}</Label>
          <Input value={user ? maskPhone(user.phone) : ""} disabled />
          <p className="text-xs text-muted-foreground">{locale === "bn" ? "ফোন নম্বর পরিবর্তন করা যাবে না" : "Phone number cannot be changed"}</p>
        </div>
        <div className="space-y-1.5">
          <Label>{t("auth.name")}</Label>
          <Input {...register("name")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" {...register("email")} /></div>
          <div className="space-y-1.5"><Label>{locale === "bn" ? "শহর" : "City"}</Label><Input {...register("city")} /></div>
        </div>
        <div className="space-y-1.5">
          <Label>{locale === "bn" ? "ঠিকানা" : "Address"}</Label>
          <Input {...register("address")} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />} {t("common.save")}
        </Button>
      </form>
    </div>
  );
}
