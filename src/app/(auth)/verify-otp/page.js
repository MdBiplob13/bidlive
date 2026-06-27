"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

function VerifyOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLanguage();
  const { setUser } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputsRef = useRef([]);

  const phone = searchParams.get("phone") || "";
  const mode = searchParams.get("mode") || "signup";
  const next = searchParams.get("next") || "/dashboard";

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const code = useMemo(() => otp.join(""), [otp]);
  const canSubmit = code.length === OTP_LENGTH && !isVerifying;

  const handleChange = (index, value) => {
    if (!/\d?/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const nextOtp = [...otp];
      nextOtp[index - 1] = "";
      setOtp(nextOtp);
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const nextOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });
    setOtp(nextOtp);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const submitOtp = async () => {
    if (!canSubmit) return;
    setIsVerifying(true);
    try {
      const { data } = await api.post("/auth/verify-otp", { code, phone, mode });
      setUser(data.data.user);
      setIsSuccess(true);
      window.setTimeout(() => {
        router.push(next);
        router.refresh();
      }, 900);
    } catch (error) {
      toast.error(error.message || (locale === "bn" ? "OTP যাচাই করা যায়নি" : "Unable to verify the code"));
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      const { data } = await api.post("/auth/send-otp", { phone, resend: true });
      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(RESEND_SECONDS);
      inputsRef.current[0]?.focus();
      toast.success(data?.message || (locale === "bn" ? "নতুন OTP পাঠানো হয়েছে" : "A new code has been sent"));
    } catch (error) {
      toast.error(error.message || (locale === "bn" ? "OTP পাঠানো যায়নি" : "Unable to resend the code"));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border border-border/70 bg-card/90 p-6 shadow-2xl shadow-black/10 backdrop-blur sm:p-8">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {locale === "bn" ? "ফোন যাচাই করুন" : "Verify your phone"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {locale === "bn"
            ? `আপনার ${phone || "ফোন নম্বর"} এ পাঠানো 6-সংখ্যার কোডটি লিখুন।`
            : `Enter the 6-digit code sent to ${phone || "your phone number"}.`}
        </p>
      </div>

      <div className={`rounded-2xl border border-border/70 bg-background/70 p-4 ${isSuccess ? "animate-pulse" : ""}`}>
        <Label className="mb-3 block text-sm font-medium">
          {locale === "bn" ? "OTP কোড" : "Verification code"}
        </Label>
        <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(element) => {
                inputsRef.current[index] = element;
              }}
              inputMode="numeric"
              aria-label={`OTP digit ${index + 1}`}
              className="h-12 text-center text-lg font-semibold"
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              maxLength={1}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{countdown > 0 ? `${locale === "bn" ? "পুনরায় পাঠাতে" : "Resend in"} ${countdown}s` : (locale === "bn" ? "কোড পেতে সমস্যা হচ্ছে؟" : "Need another code?")}</span>
          <Button type="button" variant="ghost" size="sm" onClick={resendOtp} disabled={countdown > 0 || isResending}>
            {isResending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {locale === "bn" ? "পুনরায় পাঠান" : "Resend"}
          </Button>
        </div>
      </div>

      <Button type="button" className="w-full" size="lg" onClick={submitOtp} disabled={!canSubmit}>
        {isVerifying ? <Loader2 className="mr-2 size-4 animate-spin" /> : isSuccess ? <CheckCircle2 className="mr-2 size-4" /> : null}
        {isSuccess ? (locale === "bn" ? "সফল" : "Success") : (locale === "bn" ? "যাচাই করুন" : "Verify")}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {locale === "bn" ? "সঠিক কোড লিখুন, আমরা আপনার অ্যাকাউন্টটি সক্রিয় করব।" : "Enter the correct code and we’ll activate your account."}
      </p>

      <Link href="/login" className="text-center text-sm font-medium text-primary hover:underline">
        {locale === "bn" ? "লগইন পৃষ্ঠায় ফিরে যান" : "Back to login"}
      </Link>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%)] px-4 py-8">
      <Suspense fallback={null}>
        <VerifyOtpPageContent />
      </Suspense>
    </div>
  );
}
