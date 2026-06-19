/**
 * Seed the database with categories, an admin, demo users and live auctions.
 * Run:  node scripts/seed.js     (requires MONGODB_URI in .env / .env.local)
 *
 * Admin login after seeding:  phone 01700000000 / password admin123
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("✖ MONGODB_URI not set. Add it to .env.local first.");
  process.exit(1);
}

// --- Inline schemas (script runs outside Next's @/ alias) ---
const { Schema } = mongoose;
const User = mongoose.model("User", new Schema({
  name: String, phone: { type: String, unique: true }, password: String,
  role: { type: String, default: "user" }, status: { type: String, default: "active" },
  isVerified: Boolean, rating: Number, ratingCount: Number, city: String,
}, { timestamps: true }));

const Category = mongoose.model("Category", new Schema({
  slug: { type: String, unique: true }, name: { en: String, bn: String },
  icon: String, order: Number, isActive: { type: Boolean, default: true },
}, { timestamps: true }));

const Auction = mongoose.model("Auction", new Schema({
  title: String, slug: String, description: String,
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  seller: { type: Schema.Types.ObjectId, ref: "User" },
  images: [{ url: String, publicId: String }],
  condition: String, location: String,
  startingPrice: Number, reservePrice: Number, bidIncrement: Number,
  currentBid: Number, bidCount: Number,
  startDate: Date, endDate: Date, status: String,
  views: Number, watchCount: Number, isFeatured: Boolean, reserveMet: Boolean,
}, { timestamps: true }));

const CATS = [
  { slug: "mobile", name: { en: "Mobiles", bn: "মোবাইল" }, icon: "smartphone", order: 1 },
  { slug: "cars", name: { en: "Cars", bn: "গাড়ি" }, icon: "car", order: 2 },
  { slug: "bikes", name: { en: "Bikes", bn: "বাইক" }, icon: "bike", order: 3 },
  { slug: "electronics", name: { en: "Electronics", bn: "ইলেকট্রনিক্স" }, icon: "laptop", order: 4 },
  { slug: "land", name: { en: "Land", bn: "জমি" }, icon: "map-pin", order: 5 },
  { slug: "fashion", name: { en: "Fashion", bn: "ফ্যাশন" }, icon: "shirt", order: 6 },
  { slug: "furniture", name: { en: "Furniture", bn: "আসবাবপত্র" }, icon: "sofa", order: 7 },
];

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
const daysFromNow = (d) => new Date(Date.now() + d * 86400000);

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Auction.deleteMany({})]);
  console.log("✓ Cleared collections");

  const cats = await Category.insertMany(CATS);
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));

  const hash = (p) => bcrypt.hashSync(p, 10);
  const [admin, rahul, nusrat] = await User.create([
    { name: "Admin", phone: "01700000000", password: hash("admin123"), role: "admin", status: "active", isVerified: true, city: "Dhaka" },
    { name: "Rahul Ahmed", phone: "01711111111", password: hash("password"), isVerified: true, rating: 4.8, ratingCount: 24, city: "Dhaka" },
    { name: "Nusrat Jahan", phone: "01722222222", password: hash("password"), isVerified: true, rating: 4.9, ratingCount: 31, city: "Chattogram" },
  ]);
  console.log("✓ Created users (admin: 01700000000 / admin123)");

  const auctions = [
    { title: "iPhone 15 Pro Max 256GB — Official", cat: "mobile", seller: rahul._id, img: "photo-1592750475338-74b7b21085ab", start: 120000, bid: 142500, bids: 23, end: 0.25, featured: true, reserveMet: true },
    { title: "Toyota Axio 2018 — Fresh Condition", cat: "cars", seller: nusrat._id, img: "photo-1552519507-da3b142c6e3d", start: 1500000, bid: 1820000, bids: 41, end: 2, featured: true },
    { title: "Yamaha R15 V4 — 2023", cat: "bikes", seller: rahul._id, img: "photo-1558981403-c5f9899a28bc", start: 350000, bid: 398000, bids: 18, end: 0.1 },
    { title: 'MacBook Air M2 13" — Like New', cat: "electronics", seller: nusrat._id, img: "photo-1517336714731-489689fd1ca8", start: 95000, bid: 112000, bids: 15, end: 1, featured: true },
    { title: 'Samsung 55" 4K Smart TV', cat: "electronics", seller: rahul._id, img: "photo-1593359677879-a4bb92f829d1", start: 45000, bid: 52500, bids: 9, end: 0.5 },
    { title: "Sony PlayStation 5 — Disc Edition", cat: "electronics", seller: nusrat._id, img: "photo-1606813907291-d86efa9b94db", start: 55000, bid: 63000, bids: 27, end: 3 },
    { title: "Royal Enfield Classic 350", cat: "bikes", seller: rahul._id, img: "photo-1558981806-ec527fa84c39", start: 420000, bid: 455000, bids: 12, end: 0.05 },
    { title: "Canon EOS R6 Camera Body", cat: "electronics", seller: nusrat._id, img: "photo-1502920917128-1aa500764cbd", start: 180000, bid: 205000, bids: 14, end: 4, featured: true },
  ];

  await Auction.insertMany(
    auctions.map((a) => ({
      title: a.title,
      slug: a.title.toLowerCase().replace(/[^\w]+/g, "-"),
      description: `${a.title}. Excellent condition, fully functional. Inspection welcome. Located in Bangladesh. সম্পূর্ণ কার্যকর ও পরিচ্ছন্ন।`,
      category: catBySlug[a.cat],
      seller: a.seller,
      images: [{ url: img(a.img) }],
      condition: "used",
      location: "Dhaka, Bangladesh",
      startingPrice: a.start,
      reservePrice: 0,
      bidIncrement: 0,
      currentBid: a.bid,
      bidCount: a.bids,
      startDate: new Date(),
      endDate: daysFromNow(a.end),
      status: "active",
      views: Math.floor(Math.random() * 2000) + 200,
      isFeatured: !!a.featured,
      reserveMet: !!a.reserveMet,
    }))
  );
  console.log(`✓ Created ${auctions.length} active auctions`);

  await mongoose.disconnect();
  console.log("✅ Seed complete!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
