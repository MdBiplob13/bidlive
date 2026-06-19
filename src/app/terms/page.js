import LegalPage from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms & Conditions · শর্তাবলী",
  description: "BidLive terms of service for buyers and sellers in Bangladesh.",
};

const content = {
  en: {
    title: "Terms & Conditions",
    updated: "Last updated: 18 June 2026",
    sections: [
      { h: "Acceptance of terms", p: "By creating an account or using BidLive, you agree to these Terms. If you do not agree, please do not use the platform. BidLive operates as an online auction marketplace in Bangladesh." },
      { h: "Eligibility", p: "You must be at least 18 years old and a resident of Bangladesh with a valid mobile number to register, buy, or sell on BidLive." },
      { h: "Bidding", p: [
        "Every bid you place is a binding commitment to purchase the item at that price if you win.",
        "Auto-bids automatically raise your bid up to the maximum limit you set.",
        "When an auction ends, the highest valid bidder wins and an order is created.",
        "Retracting a winning bid or refusing to complete a purchase may result in suspension.",
      ] },
      { h: "Selling", p: [
        "Sellers must list accurate descriptions, real photos, and honest item conditions.",
        "All auctions require admin approval before going live.",
        "Prohibited items (illegal goods, counterfeits, weapons, etc.) will be removed and may lead to a ban.",
      ] },
      { h: "Payments", p: "BidLive does not currently process payments. Buyers and sellers arrange payment and delivery directly. Always meet in safe, public places and inspect items before paying." },
      { h: "Prohibited conduct", p: "Fraud, shill bidding, harassment, spam, and any attempt to manipulate auctions are strictly forbidden and will result in account termination." },
      { h: "Account suspension", p: "We may suspend or ban accounts that violate these Terms, at our sole discretion, with or without notice." },
      { h: "Limitation of liability", p: "BidLive is a marketplace and is not a party to transactions between users. We are not liable for the quality, safety, or legality of listed items or for any disputes between buyers and sellers." },
      { h: "Changes", p: "We may update these Terms at any time. Continued use after changes means you accept the revised Terms." },
      { h: "Contact", p: "For questions about these Terms, contact us at support@bidlive.com.bd." },
    ],
  },
  bn: {
    title: "শর্তাবলী",
    updated: "সর্বশেষ হালনাগাদ: ১৮ জুন ২০২৬",
    sections: [
      { h: "শর্ত গ্রহণ", p: "অ্যাকাউন্ট তৈরি বা বিডলাইভ ব্যবহারের মাধ্যমে আপনি এই শর্তাবলীতে সম্মত হচ্ছেন। সম্মত না হলে প্ল্যাটফর্মটি ব্যবহার করবেন না। বিডলাইভ বাংলাদেশের একটি অনলাইন নিলাম মার্কেটপ্লেস।" },
      { h: "যোগ্যতা", p: "রেজিস্টার, ক্রয় বা বিক্রয়ের জন্য আপনাকে কমপক্ষে ১৮ বছর বয়সী এবং বৈধ মোবাইল নম্বরসহ বাংলাদেশের বাসিন্দা হতে হবে।" },
      { h: "বিডিং", p: [
        "আপনার প্রতিটি বিড একটি বাধ্যতামূলক প্রতিশ্রুতি — জিতলে ঐ দামে পণ্য কিনতে হবে।",
        "অটো-বিড আপনার নির্ধারিত সর্বোচ্চ সীমা পর্যন্ত স্বয়ংক্রিয়ভাবে বিড বাড়ায়।",
        "নিলাম শেষে সর্বোচ্চ বৈধ বিডার বিজয়ী হন এবং একটি অর্ডার তৈরি হয়।",
        "বিজয়ী বিড প্রত্যাহার বা ক্রয় সম্পন্ন করতে অস্বীকৃতি অ্যাকাউন্ট স্থগিত করতে পারে।",
      ] },
      { h: "বিক্রয়", p: [
        "বিক্রেতাদের সঠিক বিবরণ, প্রকৃত ছবি ও পণ্যের সৎ অবস্থা উল্লেখ করতে হবে।",
        "সব নিলাম লাইভ হওয়ার আগে অ্যাডমিন অনুমোদন প্রয়োজন।",
        "নিষিদ্ধ পণ্য (অবৈধ, নকল, অস্ত্র ইত্যাদি) সরিয়ে ফেলা হবে এবং ব্যান হতে পারে।",
      ] },
      { h: "পেমেন্ট", p: "বিডলাইভ বর্তমানে কোনো পেমেন্ট প্রক্রিয়া করে না। ক্রেতা ও বিক্রেতা সরাসরি পেমেন্ট ও ডেলিভারি ব্যবস্থা করেন। সবসময় নিরাপদ, প্রকাশ্য স্থানে দেখা করুন ও পেমেন্টের আগে পণ্য যাচাই করুন।" },
      { h: "নিষিদ্ধ আচরণ", p: "প্রতারণা, ভুয়া বিডিং, হয়রানি, স্প্যাম এবং নিলাম কারসাজির যেকোনো চেষ্টা কঠোরভাবে নিষিদ্ধ এবং অ্যাকাউন্ট বাতিল হবে।" },
      { h: "অ্যাকাউন্ট স্থগিতকরণ", p: "শর্ত লঙ্ঘনকারী অ্যাকাউন্ট আমরা নিজস্ব বিবেচনায়, নোটিশসহ বা ছাড়া, স্থগিত বা ব্যান করতে পারি।" },
      { h: "দায়বদ্ধতার সীমা", p: "বিডলাইভ একটি মার্কেটপ্লেস এবং ব্যবহারকারীদের মধ্যে লেনদেনের পক্ষ নয়। তালিকাভুক্ত পণ্যের মান, নিরাপত্তা বা বৈধতা এবং ক্রেতা-বিক্রেতার মধ্যে বিরোধের জন্য আমরা দায়ী নই।" },
      { h: "পরিবর্তন", p: "আমরা যেকোনো সময় এই শর্তাবলী হালনাগাদ করতে পারি। পরিবর্তনের পর ব্যবহার অব্যাহত রাখলে আপনি সংশোধিত শর্ত মেনে নিচ্ছেন।" },
      { h: "যোগাযোগ", p: "এই শর্তাবলী সম্পর্কে প্রশ্নের জন্য support@bidlive.com.bd-তে যোগাযোগ করুন।" },
    ],
  },
};

export default function TermsPage() {
  return <LegalPage content={content} />;
}
