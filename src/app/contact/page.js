import LegalPage from "@/components/legal/LegalPage";

export const metadata = {
  title: "Contact · যোগাযোগ",
  description: "Get in touch with the BidLive team.",
};

const content = {
  en: {
    title: "Contact Us",
    updated: "",
    sections: [
      { h: "Support", p: "Questions, issues, or feedback? Email us at support@bidlive.com.bd and we'll respond within 24 hours." },
      { h: "Phone", p: "Hotline: +880 1700-000000 (Sat–Thu, 10am–7pm)." },
      { h: "Office", p: "BidLive, Level 5, Gulshan Avenue, Dhaka 1212, Bangladesh." },
      { h: "Report a problem", p: "To report a fraudulent auction or user, use the 'Report' button on any auction page, or email abuse@bidlive.com.bd." },
    ],
  },
  bn: {
    title: "যোগাযোগ করুন",
    updated: "",
    sections: [
      { h: "সাপোর্ট", p: "প্রশ্ন, সমস্যা বা মতামত? support@bidlive.com.bd-তে ইমেইল করুন, আমরা ২৪ ঘণ্টার মধ্যে সাড়া দেব।" },
      { h: "ফোন", p: "হটলাইন: +৮৮০ ১৭০০-০০০০০০ (শনি–বৃহস্পতি, সকাল ১০টা–সন্ধ্যা ৭টা)।" },
      { h: "অফিস", p: "বিডলাইভ, লেভেল ৫, গুলশান অ্যাভিনিউ, ঢাকা ১২১২, বাংলাদেশ।" },
      { h: "সমস্যা রিপোর্ট করুন", p: "প্রতারণামূলক নিলাম বা ব্যবহারকারী রিপোর্ট করতে যেকোনো নিলাম পৃষ্ঠার 'রিপোর্ট' বোতাম ব্যবহার করুন, অথবা abuse@bidlive.com.bd-তে ইমেইল করুন।" },
    ],
  },
};

export default function ContactPage() {
  return <LegalPage content={content} />;
}
