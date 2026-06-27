"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, Camera, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { uploadImage } from "@/lib/uploadImage";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { maskPhone } from "@/lib/utils";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const { t, locale } = useLanguage();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const [uploading, setUploading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpPending, setOtpPending] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

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

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      await api.patch("/me", { avatar: url });
      await refresh();
      toast.success(locale === "bn" ? "ছবি আপডেট হয়েছে" : "Photo updated");
    } catch (err) {
      toast.error(err.message || (locale === "bn" ? "আপলোড ব্যর্থ" : "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const sendOtp = async () => {
    setSendingOtp(true);
    try {
      await api.post("/auth/send-otp", { phone: user?.phone, resend: true });
      setOtpPending(true);
      toast.success(locale === "bn" ? "OTP পাঠানো হয়েছে" : "OTP sent");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setVerifyingOtp(true);
    try {
      await api.post("/auth/verify-otp", { code: otpCode.trim(), phone: user?.phone });
      await refresh();
      setOtpCode("");
      setOtpPending(false);
      toast.success(locale === "bn" ? "ফোন যাচাইকরণ সম্পন্ন" : "Phone verified");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader title={t("nav.profile")} />

      <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{locale === "bn" ? "ফোন যাচাইকরণ" : "Phone verification"}</p>
            <p className="text-lg font-semibold">{user?.isVerified ? (locale === "bn" ? "যাচাইকৃত" : "Verified") : (locale === "bn" ? "অযাচাইকৃত" : "Unverified")}</p>
          </div>
          {!user?.isVerified ? (
            <Button onClick={sendOtp} disabled={sendingOtp}>
              {sendingOtp ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {locale === "bn" ? "OTP পাঠান" : "Send OTP"}
            </Button>
          ) : null}
        </div>

        {!user?.isVerified && otpPending && (
          <div className="mt-5 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="otpCode">{locale === "bn" ? "OTP কোড" : "OTP code"}</Label>
              <Input id="otpCode" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={verifyOtp} disabled={!otpCode.trim() || verifyingOtp}>
                {verifyingOtp ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {locale === "bn" ? "যাচাই করুন" : "Verify"}
              </Button>
              <Button variant="outline" onClick={sendOtp} disabled={sendingOtp}>
                {locale === "bn" ? "পুনরায় পাঠান" : "Resend"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="relative">
          <Avatar className="size-20">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="text-2xl">{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 grid size-8 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition-colors hover:bg-primary/90" title={locale === "bn" ? "ছবি পরিবর্তন" : "Change photo"}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            <input type="file" accept="image/*" className="hidden" onChange={onAvatar} disabled={uploading} />
          </label>
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{locale === "bn" ? "প্রোফাইল ছবি পরিবর্তন করতে ক্যামেরা আইকনে ক্লিক করুন" : "Click the camera icon to change your photo"}</p>
          {user?._id && (
            <Link href={`/users/${user._id}`} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              <ExternalLink className="size-3.5" /> {locale === "bn" ? "পাবলিক প্রোফাইল দেখুন" : "View public profile"}
            </Link>
          )}
        </div>
      </div>

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
