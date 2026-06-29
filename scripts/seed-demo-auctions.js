/**
 * Append demo auctions to the database WITHOUT deleting any existing data.
 * Run:  node scripts/seed-demo-auctions.js   (requires MONGODB_URI in .env.local)
 *
 * - Reuses active categories already in the DB (creates a default set only if none exist).
 * - Reuses an existing non-admin seller (creates a demo seller only if none exists).
 * - Skips any auction whose slug already exists, so it is safe to run repeatedly.
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

const { Schema } = mongoose;

const User = mongoose.models.User || mongoose.model("User", new Schema({
  name: String, phone: { type: String, unique: true }, password: { type: String, select: false },
  role: { type: String, default: "user" }, status: { type: String, default: "active" },
  isVerified: Boolean, rating: Number, ratingCount: Number, city: String,
}, { timestamps: true }));

const Category = mongoose.models.Category || mongoose.model("Category", new Schema({
  slug: { type: String, unique: true }, name: { en: String, bn: String },
  icon: String, order: Number, isActive: { type: Boolean, default: true },
}, { timestamps: true }));

const Auction = mongoose.models.Auction || mongoose.model("Auction", new Schema({
  title: String, slug: String, description: String,
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  seller: { type: Schema.Types.ObjectId, ref: "User" },
  images: [{ url: String, publicId: String }],
  condition: String, location: String,
  startingPrice: Number, reservePrice: Number, bidIncrement: Number, commissionRate: Number,
  currentBid: Number, bidCount: Number,
  startDate: Date, endDate: Date, status: String,
  views: Number, watchCount: Number, isFeatured: Boolean, reserveMet: Boolean,
}, { timestamps: true }));

const DEFAULT_CATS = [
  { slug: "mobile", name: { en: "Mobiles", bn: "মোবাইল" }, icon: "smartphone", order: 1 },
  { slug: "cars", name: { en: "Cars", bn: "গাড়ি" }, icon: "car", order: 2 },
  { slug: "bikes", name: { en: "Bikes", bn: "বাইক" }, icon: "bike", order: 3 },
  { slug: "electronics", name: { en: "Electronics", bn: "ইলেকট্রনিক্স" }, icon: "laptop", order: 4 },
  { slug: "land", name: { en: "Land", bn: "জমি" }, icon: "map-pin", order: 5 },
  { slug: "fashion", name: { en: "Fashion", bn: "ফ্যাশন" }, icon: "shirt", order: 6 },
  { slug: "furniture", name: { en: "Furniture", bn: "আসবাবপত্র" }, icon: "sofa", order: 7 },
];

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
const hoursFromNow = (h) => new Date(Date.now() + h * 3600000);
const slugify = (s) => s.toLowerCase().replace(/[^\w]+/g, "-").replace(/^-+|-+$/g, "");

// Demo auctions. `cat` is matched to a category slug; falls back to the first category if missing.
const DEMO = [
  { title: "iPhone 15 Pro Max 256GB — Official", cat: "mobile", img: "photo-1592750475338-74b7b21085ab", start: 120000, bid: 142500, bids: 23, endH: 6, featured: true, reserveMet: true },
  { title: "Samsung Galaxy S24 Ultra 512GB", cat: "mobile", img: "photo-1610945265064-0e34e5519bbf", start: 110000, bid: 128000, bids: 17, endH: 30 },
  { title: "Toyota Axio 2018 — Fresh Condition", cat: "cars", img: "photo-1552519507-da3b142c6e3d", start: 1500000, bid: 1820000, bids: 41, endH: 48, featured: true },
  { title: "Honda Vezel 2017 Hybrid", cat: "cars", img: "photo-1503376780353-7e6692767b70", start: 1900000, bid: 2150000, bids: 29, endH: 72 },
  { title: "Yamaha R15 V4 — 2023", cat: "bikes", img: "photo-1558981403-c5f9899a28bc", start: 350000, bid: 398000, bids: 18, endH: 3 },
  { title: "Royal Enfield Classic 350", cat: "bikes", img: "photo-1558981806-ec527fa84c39", start: 420000, bid: 455000, bids: 12, endH: 2 },
  { title: 'MacBook Air M2 13" — Like New', cat: "electronics", img: "photo-1517336714731-489689fd1ca8", start: 95000, bid: 112000, bids: 15, endH: 24, featured: true },
  { title: 'Samsung 55" 4K Smart TV', cat: "electronics", img: "photo-1593359677879-a4bb92f829d1", start: 45000, bid: 52500, bids: 9, endH: 12 },
  { title: "Sony PlayStation 5 — Disc Edition", cat: "electronics", img: "photo-1606813907291-d86efa9b94db", start: 55000, bid: 63000, bids: 27, endH: 60 },
  { title: "Canon EOS R6 Camera Body", cat: "electronics", img: "photo-1502920917128-1aa500764cbd", start: 180000, bid: 205000, bids: 14, endH: 90, featured: true },
  { title: "Premium Leather Sofa Set — 5 Seater", cat: "furniture", img: "photo-1555041469-a586c61ea9bc", start: 60000, bid: 71000, bids: 8, endH: 40 },
  { title: "Men's Swiss Automatic Watch", cat: "fashion", img: "photo-1524805444758-089113d48a6d", start: 25000, bid: 31500, bids: 11, endH: 18 },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  // 1. Ensure we have categories — reuse existing, seed defaults only if empty.
  let cats = await Category.find({ isActive: true }).lean();
  if (!cats.length) {
    cats = await Category.insertMany(DEFAULT_CATS);
    console.log(`✓ No categories found — created ${cats.length} default categories`);
  } else {
    console.log(`✓ Reusing ${cats.length} existing categories`);
  }
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));
  const fallbackCat = cats[0]._id;

  // 2. Find a seller — reuse an existing non-admin user, else create a demo seller.
  let seller = await User.findOne({ role: { $ne: "admin" } }).lean();
  if (!seller) {
    seller = (await User.create({
      name: "Demo Seller", phone: "01799999999", password: bcrypt.hashSync("password", 10),
      role: "user", status: "active", isVerified: true, rating: 4.8, ratingCount: 20, city: "Dhaka",
    })).toObject();
    console.log("✓ Created demo seller (phone 01799999999 / password)");
  } else {
    console.log(`✓ Reusing existing seller: ${seller.name}`);
  }

  // 3. Insert auctions, skipping any whose slug already exists.
  const docs = [];
  for (const a of DEMO) {
    const slug = slugify(a.title);
    if (await Auction.exists({ slug })) {
      console.log(`  • skip (exists): ${a.title}`);
      continue;
    }
    docs.push({
      title: a.title,
      slug,
      description: `${a.title}. Excellent condition, fully functional. Inspection welcome. Located in Bangladesh. সম্পূর্ণ কার্যকর ও পরিচ্ছন্ন।`,
      category: catBySlug[a.cat] || fallbackCat,
      seller: seller._id,
      images: [{ url: img(a.img) }],
      condition: "used",
      location: "Dhaka, Bangladesh",
      startingPrice: a.start,
      reservePrice: 0,
      bidIncrement: 0,
      commissionRate: 0.05,
      currentBid: a.bid,
      bidCount: a.bids,
      startDate: new Date(),
      endDate: hoursFromNow(a.endH),
      status: "active",
      views: Math.floor(Math.random() * 2000) + 200,
      isFeatured: !!a.featured,
      reserveMet: !!a.reserveMet,
    });
  }

  if (docs.length) {
    await Auction.insertMany(docs);
    console.log(`✓ Added ${docs.length} new demo auctions`);
  } else {
    console.log("✓ Nothing to add — all demo auctions already present");
  }

  await mongoose.disconnect();
  console.log("✅ Done!");
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
