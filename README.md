# 🛎️ BidLive — বাংলাদেশের নিলাম বাজার

A Bangladesh-focused, eBay-style **auction marketplace** built from scratch with Next.js 15 (App Router, JavaScript — no TypeScript), MongoDB, custom JWT auth, full Bangla/English i18n, and Socket.io-powered realtime messaging.

> Pricing is in **Bangladeshi Taka (৳)** only. Bidding is **not** realtime by design — only messaging is.

---

## ✨ Features

- **Bilingual UI** — Bangla (default) + English, toggle in navbar, `t()` helper, BN numerals & ৳ lakh/crore formatting.
- **Light / Dark theme** — persisted via `next-themes`.
- **Auctions** — create (with image upload/URL), browse, filter, sort, search; pending→active→sold lifecycle.
- **Bidding + Auto-bid** — eBay-style proxy bidding engine (`src/lib/auctionEngine.js`).
- **Winning logic** — auctions auto-settle (lazy sweep + cron endpoint), winner picked, order created, both parties notified.
- **Custom JWT auth** — phone + password, bcrypt, httpOnly cookies, RBAC, edge middleware.
- **User dashboard** — my auctions, my bids, watchlist, orders, notifications, requests, profile.
- **Admin dashboard** — analytics, users (ban/suspend/delete), auction moderation (approve/reject/force-close/feature), reports, categories, buyer requests, audit logs.
- **Realtime messaging** — Socket.io: presence, typing indicators, read receipts (chat persistence via REST).
- **SEO** — bilingual metadata, Open Graph, dynamic `sitemap.xml`, `robots.txt`, PWA manifest, structured product data.
- **Mobile-first**, card-based, Framer Motion animations, soft shadows.

---

## 🧱 Tech Stack

Next.js 15 · React 19 · Tailwind CSS · ShadCN-style UI · Framer Motion · React Hook Form · Zod · TanStack Query · Axios · React Hot Toast · MongoDB + Mongoose · Express + Socket.io · Cloudinary · bcryptjs · jsonwebtoken.

---

## 🚀 Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` → `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

At minimum set `MONGODB_URI` and `JWT_SECRET`. Cloudinary vars are only needed for file uploads (you can paste image URLs without them).

### 3. Seed demo data (optional but recommended)

```bash
npm run seed
```

Creates categories, demo auctions, and an admin account:

| Role  | Phone         | Password   |
|-------|---------------|------------|
| Admin | `01700000000` | `admin123` |
| User  | `01711111111` | `password` |

### 4. Run

```bash
npm run dev       # Next.js app  → http://localhost:3000
npm run socket    # Socket server → http://localhost:4000  (for messaging)
```

> The homepage renders with rich **sample data** even if MongoDB isn't connected, so you can preview the UI immediately.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/            # login / register (split-screen layout)
│   ├── api/               # all Next.js API routes (auth, auctions, bids, admin, …)
│   ├── auctions/          # listing + detail pages
│   ├── dashboard/         # user dashboard (layout + pages)
│   ├── admin/             # admin dashboard (layout + pages)
│   ├── layout.js          # root layout (fonts, providers, SEO)
│   ├── page.js            # 🏠 homepage (priority)
│   ├── sitemap.js / robots.js / manifest.js
├── components/
│   ├── ui/                # ShadCN-style primitives (button, card, input, …)
│   ├── layout/            # Navbar, Footer, SiteShell
│   ├── home/              # 10 homepage sections
│   ├── auction/           # AuctionCard, Countdown, BidPanel, AuctionDetail
│   ├── dashboard/         # shell + nav
│   └── admin/             # admin shell + nav
├── context/AuthProvider.js
├── i18n/                  # translations + LanguageProvider
├── hooks/useSocket.js
├── lib/                   # db, jwt, auth, currency, auctionEngine, validations, …
├── models/                # 13 Mongoose models
└── middleware.js          # route protection
server/socket-server.js    # standalone Socket.io server (messaging only)
scripts/seed.js
```

---

## 🔁 Auction Settlement

Auctions settle when their `endDate` passes via two mechanisms:

1. **Lazy sweep** — `GET /api/auctions` and auction detail settle expired auctions on read.
2. **Cron endpoint** — `GET /api/cron/settle` (protect with `CRON_SECRET`, schedule via Vercel Cron or any scheduler):

```
Authorization: Bearer <CRON_SECRET>
```

---

## 📝 Notes & Next Steps

- **No payments** — orders are created on win; payment integration is intentionally out of scope (future).
- **Bidding is not realtime** — refresh or re-open to see the latest bid (per product spec).
- For production multi-instance deploys, swap the in-memory rate limiter (`src/lib/rateLimit.js`) and socket presence map for Redis.
- Run `npm run lint` before committing.

Made with 💚 for Bangladesh 🇧🇩
