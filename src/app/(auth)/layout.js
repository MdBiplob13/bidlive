import Link from "next/link";
import { Gavel } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand side */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex hero-mesh">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="grid size-10 place-items-center rounded-xl bg-primary-foreground/15">
            <Gavel className="size-6" />
          </span>
          বিডলাইভ · BidLive
        </Link>
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold leading-tight">
            বাংলাদেশের সবচেয়ে বিশ্বস্ত নিলাম মার্কেটপ্লেস
          </h2>
          <p className="text-primary-foreground/80">
            মোবাইল, গাড়ি, ইলেকট্রনিক্স থেকে জমি — সবকিছুতে বিড করুন। নিরাপদ, স্বচ্ছ ও সহজ।
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">© 2026 BidLive · 🇧🇩</p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
