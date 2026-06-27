"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { registerSchema } from "@/lib/validations";
import { useLanguage } from "@/i18n/LanguageProvider";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", password: "", confirmPassword: "" },
  });

  const handleSendOtp = async (phoneNumber) => {
    if (!phoneNumber) {
      throw new Error("Phone number is required");
    }

    const { data } = await api.post("/auth/send-otp", {
      phone: phoneNumber,
      resend: false,
    });

    return data;
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", values);
      const phone = data?.data?.phone || values.phone;
      await handleSendOtp(phone);
      toast.success("OTP sent to your phone. Please verify it to continue.");
      const nextPath = `/verify-otp?phone=${encodeURIComponent(phone)}&mode=signup&next=/dashboard`;
      router.push(nextPath);
      router.refresh();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">{t("auth.registerTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("common.appName")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("auth.name")}</Label>
          <Input id="name" placeholder="আপনার নাম" {...register("name")} />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t("auth.phone")}</Label>
          <Input
            id="phone"
            inputMode="numeric"
            placeholder="01712345678"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}{" "}
          {t("auth.registerCta")}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.haveAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t("auth.loginCta")}
        </Link>
      </p>
    </div>
  );
}
