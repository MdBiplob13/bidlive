import LegalPage from "@/components/legal/LegalPage";

export const metadata = {
  title: "About · পরিচিতি",
  description: "About BidLive — Bangladesh's online auction marketplace.",
};

const content = {
  en: {
    title: "About BidLive",
    updated: "",
    sections: [
      { h: "Our mission", p: "BidLive is Bangladesh's modern online auction marketplace. We help people buy and sell anything — from mobiles and cars to land — through fair, transparent bidding, all in Bangladeshi Taka." },
      { h: "How we're different", p: [
        "Fully bilingual — Bangla and English.",
        "Mobile-first, built for how Bangladesh shops online.",
        "Transparent bidding with smart auto-bid.",
        "Verified users and a dedicated moderation team.",
      ] },
      { h: "Built for Bangladesh", p: "Every detail — from ৳ lakh/crore pricing to local categories like Land and Bikes — is designed for Bangladeshi buyers and sellers." },
    ],
  },
  bn: {
    title: "বিডলাইভ সম্পর্কে",
    updated: "",
    sections: [
      { h: "আমাদের লক্ষ্য", p: "বিডলাইভ বাংলাদেশের একটি আধুনিক অনলাইন নিলাম মার্কেটপ্লেস। মোবাইল, গাড়ি থেকে জমি — সবকিছু ন্যায্য ও স্বচ্ছ বিডিংয়ের মাধ্যমে কেনাবেচায় আমরা সাহায্য করি, সবই বাংলাদেশি টাকায়।" },
      { h: "আমরা কেন আলাদা", p: [
        "সম্পূর্ণ দ্বিভাষিক — বাংলা ও ইংরেজি।",
        "মোবাইল-ফার্স্ট, বাংলাদেশের অনলাইন কেনাকাটার জন্য তৈরি।",
        "স্মার্ট অটো-বিডসহ স্বচ্ছ বিডিং।",
        "ভেরিফায়েড ইউজার ও নিবেদিত মডারেশন টিম।",
      ] },
      { h: "বাংলাদেশের জন্য তৈরি", p: "৳ লাখ/কোটি দাম থেকে জমি ও বাইকের মতো স্থানীয় ক্যাটাগরি — প্রতিটি বিষয় বাংলাদেশি ক্রেতা-বিক্রেতার জন্য ডিজাইন করা।" },
    ],
  },
};

export default function AboutPage() {
  return <LegalPage content={content} />;
}
