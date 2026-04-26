# 🎯 LeadHunt AI

**Find businesses that need your services. Score leads automatically. Close deals faster.**

LeadHunt AI helps freelancers and agencies discover businesses with no website, poor online presence, or who are actively hiring developers — and generates personalized outreach messages in one click.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Lead Discovery** | Search businesses via Google Maps (or mock data without API key) |
| 🌐 **Website Analyzer** | Detects missing websites, SSL issues, mobile-friendliness, SEO gaps |
| 🤖 **AI Scoring** | Scores each lead 0–100 (Hot / Warm / Cold) automatically |
| 📋 **CRM Pipeline** | Track leads: New → Contacted → Replied → Closed |
| 📝 **Outreach Generator** | WhatsApp, Email, Instagram DM, and Call scripts |
| 📥 **CSV Export** | Export filtered leads with one click |
| 📊 **Dashboard** | Visual stats, city breakdowns, recent activity |

---

## 🚀 Quick Start (5 minutes)

### 1. Clone & Install

```bash
git clone <your-repo>
cd leadhunt-ai
npm install
```

### 2. Set Up Database

Get a **free** PostgreSQL database:
- [Supabase](https://supabase.com) — free 500MB ✅
- [Neon](https://neon.tech) — free 512MB ✅

Copy the connection string.

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host:5432/leadhunt"
GOOGLE_MAPS_API_KEY=""   # Optional — works without it (uses mock data)
```

### 4. Initialize Database

```bash
npx prisma db push
npx prisma generate
```

### 5. (Optional) Seed Sample Data

```bash
npx ts-node prisma/seed.ts
```

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🗂️ Project Structure

```
leadhunt-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── search/page.tsx       # Find Leads
│   │   ├── leads/
│   │   │   ├── page.tsx          # All Leads (with filters)
│   │   │   └── [id]/page.tsx     # Lead Detail + Outreach
│   │   ├── outreach/page.tsx     # Outreach Generator
│   │   ├── settings/page.tsx     # API keys & config
│   │   └── api/
│   │       ├── search/route.ts   # Main search endpoint
│   │       ├── leads/route.ts    # CRUD leads
│   │       ├── leads/[id]/route.ts
│   │       ├── dashboard/route.ts
│   │       ├── export/route.ts   # CSV export
│   │       ├── outreach/route.ts # Templates + logging
│   │       └── crm/route.ts      # Bulk status updates
│   ├── components/
│   │   ├── ui/
│   │   │   ├── sidebar.tsx       # Navigation
│   │   │   └── theme-provider.tsx
│   │   └── leads/
│   │       └── lead-card.tsx     # Lead card component
│   ├── lib/
│   │   ├── prisma.ts             # DB client
│   │   ├── utils.ts              # Helpers + constants
│   │   ├── google-maps.ts        # Google Places API
│   │   ├── website-analyzer.ts   # Website scoring
│   │   └── outreach-generator.ts # Message templates
│   └── types/index.ts            # TypeScript types
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Sample data
└── .env.local.example
```

---

## 🔑 Google Maps API Key (Optional)

Without an API key, the app generates **realistic mock data** — perfect for testing.

To get real data:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project → Enable **Places API**
3. Create an API key → Add to `.env.local`
4. Google gives **$200 free credit/month** (~11,000 searches free)

---

## 🤖 AI Scoring Logic

| Signal | Points |
|--------|--------|
| No website | +40 |
| Website score < 50 | +20 |
| Website score < 70 | +10 |
| Few/no reviews | +10 |
| No social media | +10 |
| No WhatsApp | +10 |
| Hiring developer | +15 |

**Hot** ≥ 60 pts | **Warm** 30–59 | **Cold** < 30

---

## 📊 Database Schema

```
users         — Auth (email, name)
leads         — Core lead data (80+ fields)
search_logs   — Track searches per user
outreach_logs — Track messages sent per lead
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Railway / Render

For the database — use Supabase or Neon (they both have free tiers and work directly with Vercel).

---

## 🔮 Roadmap / Bonus Features

- [ ] Chrome Extension — collect leads from Google Maps in browser
- [ ] WhatsApp one-click send with message pre-filled
- [ ] Auto dedup — remove duplicate leads across searches
- [ ] Email finder — enrich leads with business email via Hunter.io
- [ ] AI voice cold call script generator
- [ ] IndiaMART / Justdial scraper (legal public data)
- [ ] Competitor analysis per lead
- [ ] Daily email digest of new hot leads
- [ ] Slack/WhatsApp bot notifications

---

## ⚖️ Legal & Ethics

This tool only uses:
- ✅ Google Maps Places API (official, paid, rate-limited)
- ✅ Publicly visible website data (basic HTML analysis)
- ✅ Mock/simulated data in demo mode
- ✅ No scraping in violation of ToS

Always respect `robots.txt` and platform Terms of Service.

---

## 📄 License

MIT — use freely for commercial and personal projects.
