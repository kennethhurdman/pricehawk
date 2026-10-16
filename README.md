# 🦅 PriceHawk — AI-Powered Price Drop Tracker

A sleek, full-stack price tracker that monitors flights, hotels, and e-commerce deals across the web — and alerts you the moment prices drop. Powered by React, Express, Supabase, and the Google Gemini AI API.

---

## 📌 Project Overview

**PriceHawk** helps budget-conscious shoppers and frequent travelers automatically track prices across multiple categories and receive smart deal alerts without constantly refreshing pages.

### Key Capabilities

- **Multi-Category Tracking:** Monitor prices for Flights ✈️, Hotels 🏨, and E-commerce products 🛒 in one unified dashboard.
- **AI-Powered HawkBot:** A conversational AI assistant (Gemini Flash) that searches deals on your behalf using natural language.
- **Automated Price Monitoring:** Background cron worker checks tracked items on a schedule and sends alerts when prices drop.
- **Smart Email Alerts:** AI-generated, branded deal alert emails automatically sent on price drops.
- **User Authentication & Profiles:** Secure sign-in via Supabase Auth with per-user tracking limits (Free/Pro tiers).
- **Watchlist Dashboard:** Visual dashboard showing all tracked items, price history, and alert status.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey) (**required** for AI features)
- A [Supabase](https://supabase.com/) project (**required** for auth + database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/{your-github-handle}/pricehawk.git
   cd pricehawk
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Fill in your `.env` file:**
   ```env
   # Gemini AI (Required for HawkBot + AI email generation)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase (Required for auth + database)
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

5. **Run the Supabase database migration:**
   - Go to your Supabase dashboard → **SQL Editor**
   - Paste and run the contents of `supabase_migration.sql`

---

## 💻 Running the Application

### Development Mode

Starts both the Vite frontend and the Express backend concurrently:

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide React |
| **Backend** | Express.js, TypeScript (`server.ts`) |
| **Database & Auth** | Supabase (PostgreSQL + Row Level Security) |
| **AI SDK** | `@google/genai` — Gemini Flash Lite model |
| **Background Jobs** | `node-cron` — automated price check scheduler |
| **Tooling** | Vite, tsx, ESLint, TypeScript compiler |

### Architecture Overview

```
Browser (React + Vite)
        │
        ▼
Express Server (server.ts)
   ├── /api/chat-search      → HawkBot AI + web search
   ├── /api/generate-email   → AI email generation
   └── Cron Worker           → Background price monitoring
        │
        ▼
Supabase (Auth + DB)       Google Gemini API
```

---

## 📊 Current Status & Roadmap

- ✅ User authentication (sign up / sign in via Supabase)
- ✅ Multi-category price tracking (Flights, Hotels, E-commerce)
- ✅ Watchlist dashboard with item management
- ✅ HawkBot AI conversational search assistant
- ✅ AI-generated deal alert emails
- ✅ Free/Pro user tier system
- ⬜ Browser extension for one-click item tracking
- ⬜ Mobile push notifications
- ⬜ Price history charts per item
- ⬜ Multi-user sharing of tracked lists

---

## 👥 Authors & Collaborators

- **Lead Engineer:** Kenneth ([@your-github-handle]([https://github.com/your-github-handle](https://github.com/kennethhurdman)))
- **Supervisor / Reviewer:** Alan ([@alanoutrank](https://github.com/alanoutrank))
