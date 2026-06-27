"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, ShieldCheck, Camera, UploadCloud } from "lucide-react";
import api from "@/lib/api";
import { uploadImage } from "@/lib/uploadImage";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function KycPage() {
  const { user, refresh } = useAuth();
  const { t, locale } = useLanguage();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const canEditKyc = !["approved", "pending"].includes(user?.kycStatus);

  useEffect(() => {
    if (!user) return;
    reset({
      fullName: user.kycName || user.name || "",
      idNumber: user.kycIdNumber || "",
      city: user.city || "",
      address: user.address || "",
    });
    setFrontUrl(user.kycDocumentFront || "");
    setBackUrl(user.kycDocumentBack || "");
    setProfileUrl(user.avatar || "");
  }, [user, reset]);

  const uploadFile = async (file, setter, setLoading) => {
    if (!file) return;
    setLoading(true);
    try {
      const url = await uploadImage(file);
      setter(url);
      toast.success(locale === "bn" ? "আপলোড হয়েছে" : "Upload successful");
    } catch (err) {
      toast.error(err.message || (locale === "bn" ? "আপলোড ব্যর্থ" : "Upload failed"));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    if (!canEditKyc) {
      return toast.error(
        locale === "bn"
          ? "আপনার KYC বর্তমানে পর্যালোচনাধীন বা ইতোমধ্যে অনুমোদিত। আপডেট করার আগে এটি বাতিল বা ব্যর্থ হতে হবে।"
          : "Your KYC is currently pending or already approved. You can only update it after rejection or if not submitted."
      );
    }
    if (!frontUrl || !backUrl) {
      return toast.error(locale === "bn" ? "দয়া করে NID-এর উভয় দিক আপলোড করুন" : "Please upload both sides of your NID.");
    }

    try {
      await api.post("/me/kyc", {
        fullName: values.fullName,
        idNumber: values.idNumber,
        documentFrontUrl: frontUrl,
        documentBackUrl: backUrl,
        profilePhotoUrl: profileUrl,
        city: values.city,
        address: values.address,
      });
      await refresh();
      toast.success(locale === "bn" ? "KYC জমা দেওয়া হয়েছে" : "KYC submitted successfully");
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">{locale === "bn" ? "KYC যাচাই" : "KYC Verification"}</h1>
            <p className="text-sm text-muted-foreground">{locale === "bn" ? "নিলামে বিড করার আগে KYC জমা দিন" : "Submit your KYC before bidding."}</p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {!canEditKyc ? (
            <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-semibold">{locale === "bn" ? "KYC আপডেট সীমিত" : "KYC updates are restricted"}</p>
              <p className="mt-2">
                {user?.kycStatus === "approved"
                  ? locale === "bn"
                    ? "আপনার KYC ইতোমধ্যে অনুমোদিত। আর কোন পরিবর্তন করতে পারবেন না।"
                    : "Your KYC is already approved. No further changes are allowed."
                  : locale === "bn"
                    ? "আপনার KYC এখন পর্যালোচনাধীন। আপডেট করার আগে এটি বাতিল বা ব্যর্থ হতে হবে।"
                    : "Your KYC is currently pending. You may update only after it is rejected or not submitted."
                }
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">{locale === "bn" ? "পূর্ণ নাম" : "Full name"}</Label>
              <Input id="fullName" disabled={!canEditKyc} {...register("fullName", { required: true })} />
              {errors.fullName && <p className="text-xs text-destructive">{locale === "bn" ? "এটি প্রয়োজন" : "This field is required."}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idNumber">{locale === "bn" ? "NID নম্বর" : "NID number"}</Label>
              <Input id="idNumber" disabled={!canEditKyc} {...register("idNumber", { required: true })} />
              {errors.idNumber && <p className="text-xs text-destructive">{locale === "bn" ? "এটি প্রয়োজন" : "This field is required."}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{locale === "bn" ? "NID ফ্রন্ট ছবি" : "NID front photo"}</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild disabled={!canEditKyc}>
                  <label className="cursor-pointer">
                    <UploadCloud className="mr-2 size-4" /> {locale === "bn" ? "ফ্রন্ট আপলোড" : "Upload front"}
                    <input type="file" accept="image/*" className="hidden" disabled={!canEditKyc} onChange={(e) => uploadFile(e.target.files?.[0], setFrontUrl, setUploadingFront)} />
                  </label>
                </Button>
                <span className="text-sm text-muted-foreground truncate">{frontUrl || (locale === "bn" ? "কোনও ছবি নেই" : "No photo uploaded")}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{locale === "bn" ? "NID ব্যাক ছবি" : "NID back photo"}</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" asChild disabled={!canEditKyc}>
                  <label className="cursor-pointer">
                    <UploadCloud className="mr-2 size-4" /> {locale === "bn" ? "ব্যাক আপলোড" : "Upload back"}
                    <input type="file" accept="image/*" className="hidden" disabled={!canEditKyc} onChange={(e) => uploadFile(e.target.files?.[0], setBackUrl, setUploadingBack)} />
                  </label>
                </Button>
                <span className="text-sm text-muted-foreground truncate">{backUrl || (locale === "bn" ? "কোনও ছবি নেই" : "No photo uploaded")}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{locale === "bn" ? "প্রোফাইল ছবি" : "Profile photo"}</Label>
              <div className="flex items-center gap-3">
                <Avatar className="size-16">
                  <AvatarImage src={profileUrl} alt={user?.name} />
                  <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" asChild disabled={!canEditKyc}>
                  <label className="cursor-pointer flex items-center gap-2">
                    <Camera className="size-4" /> {locale === "bn" ? "আপলোড" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" disabled={!canEditKyc} onChange={(e) => uploadFile(e.target.files?.[0], setProfileUrl, setUploadingProfile)} />
                  </label>
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">{locale === "bn" ? "শহর" : "City"}</Label>
              <Input id="city" {...register("city")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">{locale === "bn" ? "পূর্ণ ঠিকানা" : "Full address"}</Label>
            <Textarea id="address" {...register("address")} rows={4} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!canEditKyc || isSubmitting || uploadingFront || uploadingBack || uploadingProfile}>
              {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {locale === "bn" ? "জমা দিন" : "Submit"}
            </Button>
            <Button variant="outline" type="button" disabled={!canEditKyc} onClick={() => {
              setFrontUrl("");
              setBackUrl("");
            }}>
              {locale === "bn" ? "রিসেট ছবি" : "Reset photos"}
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-semibold">{locale === "bn" ? "বর্তমান KYC অবস্থা" : "Current KYC status"}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{user?.kycStatus || "none"}</p>
      </div>
    </div>
  );
}
