"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthProvider";
import toast from "react-hot-toast";
import { Loader2, Plus, X, Upload, Link2 } from "lucide-react";
import { auctionSchema } from "@/lib/validations";
import api from "@/lib/api";
import { uploadImage } from "@/lib/uploadImage";
import { useLanguage } from "@/i18n/LanguageProvider";
import PageHeader from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import HelpPopover from "@/components/common/HelpPopover";

const CATEGORIES = [
  { slug: "mobile", bn: "মোবাইল", en: "Mobiles" },
  { slug: "cars", bn: "গাড়ি", en: "Cars" },
  { slug: "bikes", bn: "বাইক", en: "Bikes" },
  { slug: "electronics", bn: "ইলেকট্রনিক্স", en: "Electronics" },
  { slug: "land", bn: "জমি", en: "Land" },
  { slug: "fashion", bn: "ফ্যাশন", en: "Fashion" },
  { slug: "furniture", bn: "আসবাবপত্র", en: "Furniture" },
];

export default function NewAuctionPage() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(auctionSchema.omit({ images: true })),
  });

  const addUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    if (!/^https?:\/\//.test(u)) return toast.error("Enter a valid image URL");
    setImages((p) => [...p, u].slice(0, 10));
    setUrlInput("");
  };

  const onFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      // Unsigned client-side uploads straight to Cloudinary (no API secret).
      const urls = await Promise.all(files.map((f) => uploadImage(f)));
      setImages((p) => [...p, ...urls.filter(Boolean)].slice(0, 10));
      toast.success(urls.length > 1 ? `${urls.length} images uploaded ✓` : "Uploaded ✓");
    } catch (err) {
      toast.error(err.message || "Upload failed — you can paste an image URL instead");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  };

  const canCreateAuction = user?.kycStatus === "approved";

  const onSubmit = async (values) => {
    if (!canCreateAuction) {
      return toast.error(locale === "bn" ? "প্রথমে KYC অনুমোদন করুন" : "Please complete KYC approval first.");
    }
    if (images.length === 0) return toast.error(locale === "bn" ? "অন্তত একটি ছবি দিন" : "Add at least one image");
    try {
      const payload = { ...values, images };
      const { data } = await api.post("/auctions", payload);
      toast.success(locale === "bn" ? "নিলাম জমা হয়েছে — অনুমোদনের অপেক্ষায়" : "Submitted — pending approval");
      router.push(`/dashboard/auctions`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title={locale === "bn" ? "নতুন নিলাম তৈরি করুন" : "Create a new auction"} subtitle={locale === "bn" ? "অ্যাডমিন অনুমোদনের পর লাইভ হবে" : "Goes live after admin approval"} />

      {user?.kycStatus !== "approved" ? (
        <div className="rounded-xl border border-warning/50 bg-warning/10 p-6 text-sm text-warning-foreground shadow-sm">
          <p className="mb-3 font-semibold">{locale === "bn" ? "KYC অনুমোদন প্রয়োজন" : "KYC approval required"}</p>
          <p className="text-muted-foreground">
            {locale === "bn"
              ? "নতুন নিলাম পোস্ট করার আগে আপনার KYC গৃহীত হতে হবে। অনুগ্রহ করে প্রোফাইল থেকে KYC সম্পন্ন করুন।"
              : "Your KYC must be approved before posting new auctions. Please complete verification from your profile."}
          </p>
          <div className="mt-4">
            <Link href="/dashboard/profile/kyc" className="inline-flex items-center rounded-lg bg-warning px-4 py-2 text-sm font-semibold text-white hover:bg-warning/90">
              {locale === "bn" ? "KYC পেজে যান" : "Go to KYC page"}
            </Link>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
        <div className="space-y-1.5">
          <Label>{locale === "bn" ? "শিরোনাম" : "Title"}</Label>
          <Input placeholder={locale === "bn" ? "যেমন: iPhone 15 Pro Max" : "e.g. iPhone 15 Pro Max"} {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>{locale === "bn" ? "বিবরণ" : "Description"}</Label>
          <Textarea rows={5} placeholder={locale === "bn" ? "পণ্যের বিস্তারিত..." : "Detailed description..."} {...register("description")} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("nav.categories")}</Label>
            <Select {...register("category")} defaultValue="">
              <option value="" disabled>{locale === "bn" ? "নির্বাচন করুন" : "Select"}</option>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{locale === "bn" ? c.bn : c.en}</option>)}
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{locale === "bn" ? "অবস্থা" : "Condition"}</Label>
            <Select {...register("condition")} defaultValue="used">
              <option value="new">{locale === "bn" ? "নতুন" : "New"}</option>
              <option value="used">{locale === "bn" ? "ব্যবহৃত" : "Used"}</option>
              <option value="refurbished">{locale === "bn" ? "রিফারবিশড" : "Refurbished"}</option>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              {t("common.startingPrice")} (৳)
              <HelpPopover title={locale === "bn" ? "শুরুর দাম কী?" : "What is starting price?"}>
                {locale === "bn" ? (
                  <>
                    শুরুর দাম হলো সেই সর্বনিম্ন দাম যেখান থেকে বিডিং শুরু হবে। প্রথম বিড এই দামের সমান বা বেশি হতে হবে।
                    <br /><br />
                    কম শুরুর দাম বেশি বিডার আকর্ষণ করে, তাই অনেকে কম দিয়ে শুরু করেন।
                  </>
                ) : (
                  <>
                    The starting price is the lowest price bidding begins at. The first bid must be equal to or higher than this amount.
                    <br /><br />
                    A lower starting price often attracts more bidders, so many sellers start low.
                  </>
                )}
              </HelpPopover>
            </Label>
            <Input type="number" min="1" {...register("startingPrice")} />
            {errors.startingPrice && <p className="text-xs text-destructive">{errors.startingPrice.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              {locale === "bn" ? "রিজার্ভ দাম" : "Reserve"} (৳)
              <HelpPopover title={locale === "bn" ? "রিজার্ভ দাম কী?" : "What is reserve price?"}>
                {locale === "bn" ? (
                  <>
                    রিজার্ভ দাম হলো গোপন সর্বনিম্ন দাম যা আপনি গ্রহণ করতে রাজি। বিডিং এই দামের নিচে শেষ হলে পণ্যটি বিক্রি হবে না।
                    <br /><br />
                    এটি ঐচ্ছিক — খালি বা ০ রাখলে কোনো রিজার্ভ থাকবে না এবং সর্বোচ্চ বিডার সবসময় জিতবেন।
                  </>
                ) : (
                  <>
                    The reserve price is a hidden minimum you&apos;re willing to accept. If bidding ends below it, the item won&apos;t sell.
                    <br /><br />
                    It&apos;s optional — leave it empty or 0 for no reserve, meaning the highest bidder always wins.
                  </>
                )}
              </HelpPopover>
            </Label>
            <Input type="number" min="0" placeholder={locale === "bn" ? "ঐচ্ছিক" : "Optional"} {...register("reservePrice")} />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              {locale === "bn" ? "বিড স্টেপ" : "Bid step"} (৳)
              <HelpPopover title={locale === "bn" ? "বিড স্টেপ কী?" : "What is bid step?"}>
                {locale === "bn" ? (
                  <>
                    বিড স্টেপ হলো দুটি পরপর বিডের মধ্যে সর্বনিম্ন পার্থক্য। যেমন বর্তমান বিড ৳১,০০০ এবং স্টেপ ৳১০০ হলে, পরবর্তী বিড কমপক্ষে ৳১,১০০ হতে হবে।
                    <br /><br />
                    খালি রাখলে সিস্টেম দামের ওপর ভিত্তি করে স্বয়ংক্রিয়ভাবে উপযুক্ত স্টেপ নির্ধারণ করবে।
                  </>
                ) : (
                  <>
                    The bid step is the minimum amount each new bid must increase by. For example, if the current bid is ৳1,000 and the step is ৳100, the next bid must be at least ৳1,100.
                    <br /><br />
                    Leave it empty and the system will pick a sensible step automatically based on the price.
                  </>
                )}
              </HelpPopover>
            </Label>
            <Input type="number" min="0" placeholder={locale === "bn" ? "স্বয়ংক্রিয়" : "Auto"} {...register("bidIncrement")} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{locale === "bn" ? "শেষ তারিখ ও সময়" : "End date & time"}</Label>
            <Input type="datetime-local" {...register("endDate")} />
            {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{locale === "bn" ? "অবস্থান" : "Location"}</Label>
            <Input placeholder={locale === "bn" ? "যেমন: ঢাকা" : "e.g. Dhaka"} {...register("location")} />
          </div>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label>{locale === "bn" ? "ছবি" : "Images"} ({images.length}/10)</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={i} className="relative size-24 overflow-hidden rounded-lg border border-border">
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white">
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <label className="grid size-24 cursor-pointer place-items-center rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary">
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
              <input type="file" accept="image/*" multiple className="hidden" onChange={onFile} disabled={uploading} />
            </label>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder={locale === "bn" ? "অথবা ছবির URL পেস্ট করুন" : "or paste an image URL"} className="pl-9" />
            </div>
            <Button type="button" variant="outline" onClick={addUrl}><Plus className="size-4" /></Button>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {locale === "bn" ? "নিলাম জমা দিন" : "Submit auction"}
        </Button>
      </form>
    </div>
  );
}
