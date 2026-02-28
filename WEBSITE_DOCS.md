# MyTradeBook — Complete Website Documentation

> **Built for Indian Markets · NSE · BSE · MCX**

---

## Table of Contents

1. [What is MyTradeBook?](#1-what-is-mytradebook)
2. [Who is it For?](#2-who-is-it-for)
3. [Tech Stack](#3-tech-stack)
4. [How the App Works — Overview](#4-how-the-app-works--overview)
5. [Pages & Features — Detailed Walkthrough](#5-pages--features--detailed-walkthrough)
   - [Landing Page](#51-landing-page)
   - [Login / Authentication](#52-login--authentication)
   - [Dashboard](#53-dashboard)
   - [Trades](#54-trades)
   - [Alerts](#55-alerts)
   - [Journal](#56-journal)
   - [Analytics](#57-analytics)
   - [Studies](#58-studies)
   - [Reports](#59-reports)
   - [Calendar](#510-calendar)
   - [Mistakes](#511-mistakes)
   - [Watchlist](#512-watchlist)
   - [Settings](#513-settings)
6. [Integrations](#6-integrations)
   - [Dhan Broker Integration](#61-dhan-broker-integration)
   - [Telegram Integration](#62-telegram-integration)
7. [Backend & Database](#7-backend--database)
8. [Security](#8-security)
9. [Pricing Plans](#9-pricing-plans)
10. [Project Structure](#10-project-structure)
11. [How to Run Locally](#11-how-to-run-locally)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. What is MyTradeBook?

**MyTradeBook** (branded as **TradeBook**) is a full-featured, professional-grade **trading journal web application** built specifically for **Indian stock market traders**. It helps traders across all segments — Equity Intraday, Equity Positional, Futures, Options, and Commodities (MCX) — to:

- **Log and track** every trade they take
- **Analyse** their performance with deep statistics and charts
- **Set real-time price alerts** and receive instant Telegram notifications
- **Sync their portfolio** automatically from the Dhan broker
- **Enforce trading discipline** using rules, checklists, and mistake tracking
- **Generate weekly reports** for review and learning

The app's core philosophy is: *Stop guessing, start compounding.* By putting all trading data in one place and surfacing patterns, it helps traders identify their edge and scale it.

---

## 2. Who is it For?

| Trader Type | How They Use It |
|---|---|
| Equity Intraday traders | Log quick buy/sell trades, track daily P&L, set price cross alerts |
| Swing / Positional traders | Track multi-day positions, use TSL (trailing stop loss) automation |
| Options traders | Multi-leg strategy builder, segment-based analytics |
| Futures traders | Futures segment support, lot-size tracking |
| Commodity traders | MCX segment support |
| Trading desks / RAs | Team plan with shared studies and RA compliance mode |

**Target market:** Indian retail and semi-professional traders who want more than a broker's basic order history.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (built on Radix UI primitives) |
| **State Management** | React Query (server state) + React Context (auth/global) |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Canvas Drawing** | Konva / React Konva (chart annotation) |
| **Forms** | React Hook Form + Zod validation |
| **Backend / Database** | Supabase (PostgreSQL + Edge Functions) |
| **Auth** | Supabase Auth (Email/Password + Google OAuth) |
| **File Storage** | Supabase Storage (chart images, study attachments) |
| **Serverless Functions** | Supabase Edge Functions (Deno runtime) |
| **Broker API** | Dhan API (live prices, portfolio sync, order execution) |
| **Notifications** | Telegram Bot API |
| **PWA** | vite-plugin-pwa (installable as a mobile app) |
| **Testing** | Vitest + Testing Library |

---

## 4. How the App Works — Overview

```
User (Browser)
     │
     │  Opens app at /landing → /login → / (Dashboard)
     │
     ▼
React Frontend (Vite + React 18)
     │
     │  All data fetched via React Query hooks
     │  Forms validated with Zod schemas
     │
     ▼
Supabase Backend
     ├── PostgreSQL Database
     │     - Stores trades, alerts, studies, settings, etc.
     │     - Row-Level Security (RLS) — each user sees only their own data
     │
     ├── Edge Functions (Deno, serverless)
     │     - dhan-auth        → OAuth flow with Dhan broker
     │     - dhan-sync        → Sync portfolio from Dhan orders
     │     - dhan-execute     → Place orders via Dhan API
     │     - evaluate-alerts  → Cron job, checks alert conditions every 5 min
     │     - telegram-verify  → Verify Telegram chat ID
     │     - telegram-notify  → Send Telegram messages
     │     - instrument-sync  → Sync NSE/BSE/MCX scrip master (50K+ instruments)
     │     - generate-weekly-report → Compute weekly P&L summary
     │     - morning-briefing → Daily market briefing notification
     │     - eod-report       → End-of-day summary
     │
     └── Supabase Storage
           - trade-charts     → User-uploaded chart screenshots
           - study-attachments → Research file attachments
     │
     ▼
External APIs
     ├── Dhan API  → Live LTP prices, order history, execution
     └── Telegram Bot API → Alert notifications, weekly reports
```

### Core Data Flow

**Creating a trade:**
1. User fills the Create Trade modal
2. Data validated by Zod schema on the frontend
3. `useTrades` hook calls Supabase insert
4. RLS policy ensures the record is tagged with `user_id`
5. React Query invalidates the trades cache → UI updates instantly
6. Optional Telegram notification sent via Edge Function

**Alert evaluation:**
1. Supabase cron triggers `evaluate-alerts` every 5 minutes
2. Edge function fetches all active alerts (filtered by RLS per user)
3. For each user, it fetches live prices from Dhan API
4. Checks alert condition (price above/below threshold, % change, volume spike)
5. If triggered: marks alert as triggered, sends Telegram message, creates chain alerts

**Portfolio sync from Dhan:**
1. User clicks "Sync" in the Trades page
2. `dhan-sync` Edge Function called
3. Fetches user's order history from Dhan API
4. Matches BUY/SELL pairs, calculates P&L
5. Creates or updates trades in the database
6. Returns a sync summary to the user

---

## 5. Pages & Features — Detailed Walkthrough

### 5.1 Landing Page

**Route:** `/landing`

The public marketing page shown to visitors who are not logged in.

**Sections:**
- **Sticky Navbar** — Logo, navigation links (Features, How It Works, Pricing, Reviews), Sign In + Get Started buttons
- **Hero Section** — Large headline *"Your Trading Edge, Quantified & Automated"*, description, two CTA buttons, and a live animated **dashboard preview mockup** showing KPI cards, equity curve SVG, and a recent trades list
- **Stats Bar** — Animated counters: 10,000+ Trades Logged, 98% Uptime SLA, 5 Market Segments, <1s Alert Latency
- **Features (Bento Grid)** — Six feature cards:
  - Smart Journal (trade logging with charts & tags)
  - Deep Analytics (equity curves, drawdown, heatmaps)
  - Real-Time Alerts (price alerts + Telegram)
  - Trailing Stop Loss (TSL engine)
  - Broker Sync (Dhan integration)
  - Rules Engine (checklists, mistake tagging)
- **How It Works** — Three steps: Log Trades → Spot Patterns → Automate & Scale
- **Testimonials** — Three trader reviews
- **Pricing** — Three plans (Free, Pro ₹499/mo, Team ₹1,499/mo)
- **Final CTA** — Call to action to sign up
- **Footer** — Links to Product, Support, Legal sections

All sections use a `FadeIn` component that animates elements into view as the user scrolls (Intersection Observer API). Counters use an animated count-up effect with easing.

---

### 5.2 Login / Authentication

**Route:** `/login`

- Email/Password login and registration
- Google OAuth (one-click sign-in)
- Managed by Supabase Auth
- After login, JWT is stored in localStorage and sent with every API request
- `AuthProvider` (React Context) wraps the entire app and provides `user`, `session`, and `loading` state
- `ProtectedRoute` component redirects unauthenticated users to `/login`

---

### 5.3 Dashboard

**Route:** `/` (home, protected)

The main overview page after login. It is fully **customisable** — the user can show/hide widgets and reorder them.

**Dashboard Widgets:**

| Widget | Description |
|---|---|
| **KPI Cards** | Today's P&L, Win Rate, Open Trades count, Active Alerts count |
| **Daily/Sector Chart** | Bar chart of P&L by day or sector, sits alongside the Alerts panel |
| **Alerts Panel** | Quick view of active alerts in the sidebar of the chart widget |
| **Positions Table** | Table of currently open trades with live LTP prices (polled from Dhan) |
| **Monthly Metrics** | Month-over-month comparison of key stats |
| **Quick Actions** | Shortcut buttons (New Trade, New Alert, Sync, etc.) |

**Controls:**
- **Month selector** — Switch between last 3 months (quick toggle)
- **Segment filter** — All / Intraday / Positional / Futures / Options / Commodities
- **Live indicator** — Shows a pulsing "Live" badge when open trades are being tracked with real-time prices
- **Widget customizer** — Settings popover to toggle visibility and change widget order, with a Reset button

---

### 5.4 Trades

**Route:** `/trades`

The central trade management page. Every trade in the system is logged and managed here.

**What you can do:**
- **Create trades** (manually via modal)
- **View all trades** in list or grid view
- **Search** by symbol name
- **Filter** by status (Planned, Open, Closed, Cancelled) and by segment
- **Sort** by Latest, Highest P&L, Lowest P&L, Symbol A–Z
- **Live prices** — Open trades show real-time LTP from Dhan API with polling
- **Bulk operations** — Select multiple trades to bulk-cancel or bulk-close at market price
- **Trade templates** — Save and reuse a trade setup with pre-filled fields
- **Multi-leg strategy** — Create complex options strategies with multiple legs
- **Sync from Dhan** — Auto-import trades from your broker order history

**Trade card (InsightCard) shows:**
- Symbol name, direction (BUY/SELL), segment label
- Status badge (color coded)
- Entry price, Stop Loss, Target levels
- Potential % gain and Risk:Reward ratio
- Current LTP with day change %
- Realized P&L (for closed trades)
- Quantity, entry date, notes snippet
- Action menu: View Details, Cancel, Delete

**Create Trade Modal fields:**
- Symbol (searchable instrument picker from 50K+ scrips)
- Segment (Intraday, Positional, Futures, Options, MCX)
- Direction (BUY / SELL)
- Quantity
- Entry Price, Stop Loss
- Targets (multiple targets supported)
- Notes, Setup tags, Confidence score, Rating
- Chart screenshot upload

**Trade Detail Modal:**
- Full trade info including all fields
- Edit trade inline
- Close trade at a specified exit price
- Add notes and rating post-trade
- View attached chart image

---

### 5.5 Alerts

**Route:** `/alerts`

Price and volume alert management page.

**Alert condition types:**
- Price Above a threshold
- Price Below a threshold
- Price Crosses Above (detects cross, not just level)
- Price Crosses Below
- % Change Up (intraday percentage move)
- % Change Down
- Volume Spike
- Custom (user-defined condition text)

**Alert features:**
- **Recurrence:** ONCE (auto-deactivates after first trigger), DAILY (resets daily), CONTINUOUS (stays active)
- **Cooldown:** Minutes to wait before re-triggering the same alert
- **Active hours only:** Only evaluate during market hours (9:15–15:30 IST)
- **Snooze:** Temporarily pause an alert until a future time
- **Telegram delivery:** Toggle on/off per alert
- **Chain alerts:** Trigger a follow-up alert when this one fires

**Tabs:** All / Active / Triggered / Paused / Expired

**Alert card shows:**
- Symbol, condition type (color coded — green for bullish, red for bearish)
- Threshold value
- Recurrence badge
- Trigger count and last trigger time
- Active/paused status with toggle
- Time since last trigger / countdown to snooze expiry

**Evaluation engine:** The `evaluate-alerts` Edge Function runs on a cron schedule every 5 minutes. It fetches live LTP from Dhan, compares against each alert's condition and threshold, and sends a Telegram message if triggered.

---

### 5.6 Journal

**Route:** `/journal`

The trading journal gives a deep, retrospective view of trading performance. It is organised into multiple tabs:

| Tab | What it shows |
|---|---|
| **Dashboard** | Summary cards (total P&L, win rate, avg win/loss, profit factor, expectancy), equity curve, key metrics |
| **Equity Curve** | Line chart of cumulative P&L over time, with drawdown visualization |
| **Performance Tables** | Tabular breakdown by symbol, segment, setup tag |
| **Patterns & Mistakes** | Which setups are working, which mistakes are most costly |
| **Calendar View** | Heat-map calendar — each day is colored green/red based on net P&L |
| **Kanban Board** | Trades organised in Kanban columns by status |

**Filters available:**
- Segment (All, Intraday, Positional, Futures, Options, Commodities)
- Date range (Last 30 / 60 / 90 days or custom date picker)

**Export:** Download journal data as CSV/PDF for record keeping.

---

### 5.7 Analytics

**Route:** `/analytics`

The deep analytics page for quantitative performance review.

**KPI Stats (top row):**
- Win Rate
- Total P&L (all time)
- Average Win per trade
- Average Loss per trade

**KPI Stats (second row):**
- Expectancy (expected P&L per trade)
- Profit Factor (gross profits / gross losses)
- Best single trade
- Worst single trade

**Charts and Analysis panels:**

| Panel | Description |
|---|---|
| **Equity Curve & Drawdown** | Combined chart: cumulative P&L line + max drawdown area, with starting capital baseline |
| **Segment Performance** | Bar chart comparing win rate, avg P&L, and trade count per segment |
| **Time of Day Analysis** | Heatmap/bar chart showing performance by hour of day (when are you most profitable?) |
| **Day of Week Analysis** | Performance breakdown by Monday–Friday |
| **Streak Tracker** | Current win/loss streak, max consecutive wins/losses |
| **Setup Tag Performance** | Which setups (e.g., "Breakout", "Reversal") are most profitable |
| **Risk/Reward Analytics** | Distribution of actual risk:reward achieved vs planned |

---

### 5.8 Studies

**Route:** `/studies`

A research notebook for market analysis and trade ideas, separate from actual executed trades.

**Categories:** Technical, Fundamental, News, Sentiment, Other

**Study card shows:**
- Title and category
- Status: Draft / Active / Triggered / Invalidated / Archived
- Tags for quick filtering
- Notes preview
- Creation date
- Attachments (PDFs, images)

**Use case:** Write up a sector thesis, a specific stock analysis, or a macro view. Link it to actual trades later.

---

### 5.9 Reports

**Route:** `/reports`

Weekly performance reports, grouped by week and segment.

**Features:**
- View all past weekly reports
- Each report shows: total P&L, total trades, win rate for the week
- Breakdown by segment within each week
- **Generate Report** — manually trigger the Edge Function to compute a fresh report
- **Send to Telegram** — push the weekly summary directly to your Telegram chat
- Download weekly data

The `generate-weekly-report` Edge Function computes P&L, win rate, and trade counts per segment for the trailing 7-day period and stores the result in the `weekly_reports` database table.

---

### 5.10 Calendar

**Route:** `/calendar`

A calendar heat-map view of trading activity. Each day is coloured based on net P&L:
- Green shades = profitable day
- Red shades = losing day
- Gray = no trades

Clicking a day shows the trades taken on that date.

---

### 5.11 Mistakes

**Route:** `/mistakes`

A dedicated mistake tracker to build self-awareness and discipline.

- Tag trades with specific mistakes (e.g., "Chased entry", "Ignored SL", "FOMO", "Oversize position")
- View all tagged mistakes with trade P&L context
- Mistake frequency chart — see which mistakes happen most often
- Helps identify psychological and process weaknesses

---

### 5.12 Watchlist

**Route:** `/watchlist`

A multi-watchlist manager for tracking instruments of interest.

- Create multiple named watchlists (up to 10 on Pro plan)
- Add instruments by searching the 50K+ scrip master
- View LTP and day change for each watchlist item (pulled from Dhan live prices)
- Quickly create an alert or a trade from a watchlist item
- Instruments span NSE equity, F&O, BSE, and MCX

---

### 5.13 Settings

**Route:** `/settings`

User account and configuration. Organised into 5 tabs:

| Tab | Settings available |
|---|---|
| **Profile** | Name, email, avatar, starting capital |
| **Preferences** | Theme (dark/light), default segment, default SL%, app language |
| **Security** | Change password, active sessions management |
| **Integrations** | Connect Dhan broker (OAuth flow), connect Telegram bot, configure Telegram chats per segment |
| **Tags** | Create and manage custom setup tags and mistake tags used across the app |

**Integrations tab in detail:**
- **Dhan:** Click "Connect Dhan" → redirects to Dhan OAuth → returns with access token → stored encrypted in `user_settings`. Then enables live prices, portfolio sync, and order execution.
- **Telegram:** Enter your Telegram bot token and chat ID → verify using the `telegram-verify` Edge Function → after verification, notifications are enabled. Supports multiple Telegram destinations (e.g., send Intraday alerts to one group, Positional alerts to another).

---

## 6. Integrations

### 6.1 Dhan Broker Integration

**What it enables:**
- Real-time LTP (Last Traded Price) for open trades and watchlists
- Auto-import of trades from your Dhan order history (`dhan-sync`)
- One-click order execution directly from the app (`dhan-execute`)
- Portfolio monitoring with trailing stop loss automation (`trade-monitor`)

**How it works:**
1. User initiates OAuth from Settings > Integrations
2. Redirected to Dhan's authorization page
3. On callback (`/dhan-callback`), the `dhan-auth` Edge Function exchanges the authorization code for an access token
4. Token stored in `user_settings.dhan_access_token` with expiry
5. All Dhan API calls made server-side from Edge Functions (never exposed to browser)

**Live price polling:**
- The `useLivePrices` hook polls Dhan's market data endpoint every 30 seconds for open trade symbols
- Displays LTP, day change %, and timestamps on Trade cards and Dashboard

### 6.2 Telegram Integration

**What it enables:**
- Instant notification when an alert triggers
- Morning briefing message
- End-of-day P&L summary
- Weekly report delivery
- Custom messages for trade events (open, close, target hit, SL hit)

**How it works:**
1. User creates a Telegram bot and gets a bot token
2. Enters bot token and chat ID in Settings > Integrations
3. `telegram-verify` Edge Function sends a test message to confirm the connection
4. Alert triggers call `telegram-notify` Edge Function which formats and sends a rich message
5. Multiple `telegram_chats` can be configured — route alerts by segment (e.g., Options alerts only go to the Options trading group)

**Message format includes:** Symbol, condition, triggered price, time, and (if connected to a trade) the current P&L.

---

## 7. Backend & Database

### Database Tables

| Table | Purpose |
|---|---|
| `trades` | Core trade records — symbol, type, qty, entry/exit prices, SL, targets, P&L, status |
| `alerts` | Price/volume alerts with conditions, thresholds, recurrence, cooldown |
| `studies` | Research notes — title, content, tags, category, status, attachments |
| `strategy_trades` | Multi-leg options strategies with JSONB legs array |
| `user_settings` | Per-user config: Dhan credentials, Telegram settings, default SL%, starting capital |
| `telegram_chats` | Multiple Telegram destinations per user, filterable by segment |
| `instrument_master` | 50,000+ NSE/BSE/MCX instruments with trading symbol, exchange, lot size, expiry, strike |
| `watchlist_items` | User watchlists linked to instruments |
| `weekly_reports` | Pre-computed weekly P&L summaries per segment |
| `audit_log` | Change history for all records (compliance and debugging) |
| `trade_patterns` | Junction table: trades ↔ setup pattern tags |
| `trade_mistakes` | Junction table: trades ↔ mistake tags |

### Key Database Features

- **Row-Level Security (RLS):** Every table enforces `auth.uid() = user_id` — users cannot access each other's data
- **Soft Delete:** Records are marked `deleted_at` rather than permanently removed (allows recovery)
- **Audit Log:** All INSERT/UPDATE/DELETE operations are logged with before/after values
- **20+ Performance Indexes:** Composite indexes on `(user_id, status, entry_time)` and similar patterns ensure fast queries even with large datasets
- **22 Migrations:** Structured migration files maintain schema version history

### Edge Functions (Deno)

All backend logic runs as Supabase Edge Functions — serverless, globally deployed:

| Function | Trigger | Purpose |
|---|---|---|
| `dhan-auth` | HTTP (user action) | Exchange OAuth code for Dhan token |
| `dhan-sync` | HTTP (user action) | Import portfolio from Dhan orders |
| `dhan-execute` | HTTP (user action) | Place an order via Dhan API |
| `trade-monitor` | HTTP / cron | Check and enforce trailing stop loss |
| `evaluate-alerts` | Cron (every 5 min) | Evaluate all active alerts, send notifications |
| `telegram-verify` | HTTP (user action) | Confirm Telegram bot connectivity |
| `telegram-notify` | Internal | Send formatted Telegram message |
| `instrument-sync` | Cron (daily) | Refresh the 50K+ instrument master from NSE/BSE |
| `instrument-search` | HTTP | Search instruments by symbol for the picker UI |
| `generate-weekly-report` | HTTP / cron | Compute weekly P&L stats per segment |
| `morning-briefing` | Cron (morning) | Send daily trading briefing via Telegram |
| `eod-report` | Cron (market close) | Send end-of-day P&L summary via Telegram |

All functions share common utilities (`_shared/`): structured logging, standardised error handling, retry logic, and input validation.

---

## 8. Security

- **Authentication:** Supabase JWT tokens; every request validated server-side
- **Row-Level Security:** Database enforces multi-tenancy — no user can ever read another's data
- **API Keys:** Service role key (full DB access) is only used server-side in Edge Functions, never exposed to the browser. Browser only uses the publishable/anon key
- **Input Validation:** All Edge Functions validate and sanitize inputs using shared validation utilities
- **Soft Delete:** Prevents accidental permanent data loss
- **Audit Log:** Full change history for compliance and debugging
- **No SEBI Registration:** App displays a disclaimer — it is for educational/personal record-keeping only

---

## 9. Pricing Plans

| Plan | Price | Key Limits |
|---|---|---|
| **Free** | ₹0 forever | Up to 50 trades/month, basic analytics, 1 watchlist |
| **Pro** | ₹499/month | Unlimited trades, all analytics, Telegram, TSL engine, Dhan integration, 10 watchlists, priority support, 14-day free trial |
| **Team** | ₹1,499/month | Everything in Pro + 5 team members, shared studies & alerts, RA compliance mode, API access, dedicated account manager |

---

## 10. Project Structure

```
mytradebook/
├── src/
│   ├── pages/               # One file per route
│   │   ├── Landing.tsx      # Public marketing page
│   │   ├── Login.tsx        # Auth page
│   │   ├── Index.tsx        # Dashboard entry
│   │   ├── Dashboard.tsx    # Dashboard logic & layout
│   │   ├── Trades.tsx       # Trade management
│   │   ├── Alerts.tsx       # Alert management
│   │   ├── Journal.tsx      # Trading journal
│   │   ├── Analytics.tsx    # Deep analytics
│   │   ├── Studies.tsx      # Research notes
│   │   ├── Reports.tsx      # Weekly reports
│   │   ├── Calendar.tsx     # Calendar heat-map
│   │   ├── Mistakes.tsx     # Mistake tracker
│   │   ├── Watchlist.tsx    # Watchlist manager
│   │   ├── Settings.tsx     # User settings
│   │   └── DhanCallback.tsx # OAuth callback handler
│   │
│   ├── components/
│   │   ├── analytics/       # Equity curve, segment charts, heatmaps
│   │   ├── dashboard/       # KPI cards, positions table, quick actions
│   │   ├── journal/         # Summary cards, equity curve, kanban, calendar
│   │   ├── layout/          # MainLayout, Sidebar, ProtectedRoute
│   │   ├── modals/          # Create/Edit/Delete modals for trades, alerts, studies
│   │   ├── settings/        # Profile, Preferences, Security, Integrations, Tags forms
│   │   ├── telegram/        # Telegram connection UI components
│   │   ├── trade/           # Multi-leg strategy builder
│   │   └── ui/              # shadcn/ui base components + custom (InsightCard, ViewToggle, etc.)
│   │
│   ├── hooks/               # 20+ custom React hooks
│   │   ├── useTrades.ts     # CRUD + filters + summary for trades
│   │   ├── useAlerts.ts     # CRUD for alerts
│   │   ├── useStudies.ts    # CRUD for studies
│   │   ├── useLivePrices.ts # Dhan live price polling
│   │   ├── useDhanIntegration.ts  # Sync + execute via Dhan
│   │   ├── useJournalAnalytics.ts # Journal-specific computed metrics
│   │   ├── useUserSettings.ts     # User settings CRUD
│   │   ├── useTradeTemplates.ts   # Trade template CRUD
│   │   └── useDashboardLayout.ts  # Widget visibility/ordering
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx  # User session, login, logout
│   │
│   ├── lib/
│   │   ├── constants.ts     # TradeStatus, segments, app-wide enums
│   │   ├── calculations.ts  # P&L, win rate, profit factor calculations
│   │   ├── formatting.ts    # Currency, percentage, date formatting
│   │   ├── errors.ts        # Error handling utilities
│   │   └── telegram.ts      # Telegram message helpers
│   │
│   ├── types/
│   │   └── trade.ts         # TypeScript trade type definitions
│   │
│   └── integrations/
│       └── supabase/        # Supabase client, auto-generated DB types
│
├── supabase/
│   ├── functions/           # Deno Edge Functions (11 functions)
│   │   └── _shared/         # Shared: logger, errors, retry, validation
│   └── migrations/          # 22 SQL migration files
│
├── public/                  # Static assets (icons, images)
├── ARCHITECTURE.md          # System architecture reference
├── IMPROVEMENTS.md          # Phase 1–3 improvement log
├── SECURITY_NOTES.md        # Security audit findings
├── .env.example             # Environment variable template
└── package.json             # Dependencies and scripts
```

---

## 11. How to Run Locally

**Prerequisites:** Node.js 18+ and npm, a Supabase project, optionally Dhan API credentials and a Telegram bot.

```bash
# 1. Clone the repository
git clone <repo-url>
cd mytradebook

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Supabase URL and publishable key:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# 4. Start the development server
npm run dev
# App runs at http://localhost:5173

# 5. Other useful commands
npm run build       # Production build → dist/
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run test        # Run Vitest unit tests
```

**Deploying Edge Functions (Supabase CLI):**
```bash
supabase functions deploy evaluate-alerts
supabase functions deploy telegram-notify
# etc.
```

**Applying database migrations:**
```bash
supabase db push
```

---

## 12. Future Roadmap

### Phase 4 — Scalability
- Replace 30-second polling with Supabase Realtime (WebSocket)
- Pagination and virtual scrolling for large trade lists
- Bundle size optimisation and code splitting analysis
- Rate limiting on Edge Functions

### Phase 5 — Features
- Multi-broker support (Zerodha, Upstox, Angel One)
- Paper trading / simulation mode
- Social journal (publicly share studies and performance)
- Mobile app (React Native)

### Phase 6 — Advanced
- AI-powered trade analysis and coaching
- Backtesting engine for strategies
- Automated trading rule execution
- Tax report generation (ITR-compatible)

---

*Last updated: February 2026*
*Version: 1.0.0 (Post Phase 1–3 Improvements)*
*Disclaimer: TradeBook is not SEBI registered. It is a personal record-keeping and analysis tool for educational purposes only.*
