import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "বিডলাইভ — বাংলাদেশের নিলাম বাজার | BidLive Auctions",
    template: "%s | বিডলাইভ BidLive",
  },
  description:
    "বাংলাদেশের #১ অনলাইন নিলাম মার্কেটপ্লেস। মোবাইল, গাড়ি, ইলেকট্রনিক্স, জমি ও আরও অনেক পণ্যে বিড করুন। Bangladesh's #1 online auction marketplace.",
  keywords: ["নিলাম", "auction", "Bangladesh", "bidding", "marketplace", "বিডলাইভ", "BidLive"],
  openGraph: {
    type: "website",
    locale: "bn_BD",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: "BidLive",
    title: "বিডলাইভ — বাংলাদেশের নিলাম বাজার",
    description: "বাংলাদেশের #১ অনলাইন নিলাম মার্কেটপ্লেস।",
  },
  twitter: { card: "summary_large_image", title: "BidLive — Bangladesh Auctions" },
  robots: { index: true, follow: true },
  alternates: { languages: { "bn-BD": "/", "en-US": "/?lang=en" } },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#006a4e" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1f18" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className={`${inter.variable} ${bangla.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
