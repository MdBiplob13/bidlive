/**
 * Demo data so the homepage renders beautifully even before MongoDB is
 * seeded/connected. Real data (from the DB) takes precedence when available.
 */
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;
const now = 1781000000000; // fixed base ms to keep server render deterministic

function future(hours) {
  return new Date(now + hours * 3600000).toISOString();
}

export const SAMPLE_CATEGORIES = [
  { slug: "mobile", name: { en: "Mobiles", bn: "মোবাইল" }, icon: "smartphone" },
  { slug: "cars", name: { en: "Cars", bn: "গাড়ি" }, icon: "car" },
  { slug: "bikes", name: { en: "Bikes", bn: "বাইক" }, icon: "bike" },
  { slug: "electronics", name: { en: "Electronics", bn: "ইলেকট্রনিক্স" }, icon: "laptop" },
  { slug: "land", name: { en: "Land", bn: "জমি" }, icon: "map-pin" },
  { slug: "fashion", name: { en: "Fashion", bn: "ফ্যাশন" }, icon: "shirt" },
  { slug: "furniture", name: { en: "Furniture", bn: "আসবাবপত্র" }, icon: "sofa" },
];

export const SAMPLE_AUCTIONS = [
  { _id: "s1", title: "iPhone 15 Pro Max 256GB — Official", images: [{ url: img("photo-1592750475338-74b7b21085ab") }], startingPrice: 120000, currentBid: 142500, bidCount: 23, views: 1240, endDate: future(5), reserveMet: true },
  { _id: "s2", title: "Toyota Axio 2018 — Fresh Condition", images: [{ url: img("photo-1552519507-da3b142c6e3d") }], startingPrice: 1500000, currentBid: 1820000, bidCount: 41, views: 3110, endDate: future(28) },
  { _id: "s3", title: "Yamaha R15 V4 — 2023", images: [{ url: img("photo-1558981403-c5f9899a28bc") }], startingPrice: 350000, currentBid: 398000, bidCount: 18, views: 980, endDate: future(2) },
  { _id: "s4", title: 'MacBook Air M2 13" — Like New', images: [{ url: img("photo-1517336714731-489689fd1ca8") }], startingPrice: 95000, currentBid: 112000, bidCount: 15, views: 760, endDate: future(11) },
  { _id: "s5", title: "Samsung 55\" 4K Smart TV", images: [{ url: img("photo-1593359677879-a4bb92f829d1") }], startingPrice: 45000, currentBid: 52500, bidCount: 9, views: 540, endDate: future(1) },
  { _id: "s6", title: "Sony PlayStation 5 — Disc Edition", images: [{ url: img("photo-1606813907291-d86efa9b94db") }], startingPrice: 55000, currentBid: 63000, bidCount: 27, views: 1890, endDate: future(8) },
  { _id: "s7", title: "Royal Enfield Classic 350", images: [{ url: img("photo-1558981806-ec527fa84c39") }], startingPrice: 420000, currentBid: 455000, bidCount: 12, views: 1120, endDate: future(0.5) },
  { _id: "s8", title: "Canon EOS R6 Camera Body", images: [{ url: img("photo-1502920917128-1aa500764cbd") }], startingPrice: 180000, currentBid: 205000, bidCount: 14, views: 670, endDate: future(16) },
];

export const SAMPLE_TESTIMONIALS = [
  { name: "রাহুল আহমেদ", city: "ঢাকা", text: { bn: "প্রথমবার নিলামে আইফোন কিনলাম, দারুণ অভিজ্ঞতা! দাম অনেক কম পেয়েছি।", en: "Bought my first iPhone via auction — amazing experience and great price!" }, rating: 5 },
  { name: "Nusrat Jahan", city: "Chattogram", text: { bn: "আমার পুরোনো গাড়ি এখানে ভালো দামে বিক্রি করেছি। বিডিং পুরোপুরি স্বচ্ছ।", en: "Sold my old car here at a great price. The bidding is fully transparent." }, rating: 5 },
  { name: "Karim Sheikh", city: "Sylhet", text: { bn: "অটো-বিড ফিচারটা অসাধারণ। সারাক্ষণ বসে থাকতে হয় না।", en: "The auto-bid feature is brilliant. No need to sit and watch all day." }, rating: 4 },
];
