<p align="center">
  <img src="public/assets/logo.png" alt="TradeBook Logo" width="80" />
</p>

<h1 align="center">TradeBook — Trading Journal for Indian Markets</h1>

<p align="center">
  <strong>Track, analyze, and improve your trades.</strong><br/>
  Real-time alerts, broker integration, and deep analytics built for Equity, F&O, and Commodity traders in India.
</p>

<p align="center">
  <a href="https://mytradebook.lovable.app">Live App</a> · 
  <a href="https://tradebook.mrchartist.com">Website</a>
</p>

---

## 📸 Overview

TradeBook is a **full-stack Progressive Web App (PWA)** designed specifically for Indian market traders (NSE, BSE, MCX). It combines a comprehensive trade journal with real-time analytics, broker integration (Dhan), Telegram notifications, and AI-powered insights — all in one place.

---

## ✨ Features

### 📊 Dashboard
- **Customizable widget layout** — drag-and-drop reordering with focus mode & density settings
- **Daily P&L tracker** with animated numbers and sparklines
- **Equity curve** with drawdown visualization
- **Risk meter** & discipline score widgets
- **Morning briefing** — AI-generated pre-market summary
- **Achievement badges** — gamified milestones for trading consistency
- **Portfolio heatmap** — sector-wise position overview
- **Streak tracker** — win/loss streak monitoring
- **Quick actions** — fast-access shortcuts for common tasks
- **Floating trade ticker** — live scrolling P&L updates

### 📝 Trade Management
- **Create/edit trades** with full metadata: entry/exit prices, stop-loss, targets, quantity, segment, timeframe
- **Multi-leg strategy support** — options spreads (straddles, strangles, etc.)
- **CSV import** — bulk import trades from broker exports
- **Trade templates** — save and reuse common trade setups
- **Post-trade review wizard** — structured reflection with execution quality rating
- **Trade coach** — AI-powered feedback on individual trades
- **Emotion tagging** — track psychological state per trade
- **Chart image attachments** — upload screenshots for visual reference
- **Trailing stop-loss** — configurable TSL profiles with automatic tracking
- **Position sizing calculator** — risk-based lot/quantity calculation
- **Quick close popover** — rapid trade closure with one click
- **Swipeable trade rows** — mobile-friendly gesture controls

### 🔔 Alerts System
- **Price alerts** — above/below threshold, percent change, volume spike
- **Smart alert suggestions** — AI recommends alerts based on your portfolio
- **Alert chaining** — trigger follow-up alerts automatically
- **Multi-channel delivery** — in-app notifications + Telegram
- **Scanner-linked alerts** — auto-trigger from custom scanners
- **Snooze & cooldown** — intelligent alert throttling
- **Expiry dates** — auto-deactivate stale alerts
- **Batch operations** — manage alerts in bulk

### 📈 Analytics & Reports
- **Win rate matrix** — by setup tag, segment, timeframe
- **Day-of-week analysis** — identify your best/worst trading days
- **Time-of-day analysis** — optimize entry timing
- **Emotional P&L correlation** — how mood affects performance
- **Equity curve with drawdown** — max drawdown, recovery periods
- **Risk-reward analytics** — R-multiple distribution
- **Sector rotation heatmap** — visualize sector performance trends
- **Streak tracker** — consecutive win/loss analysis
- **Segment performance** — Equity vs F&O vs Commodity breakdown
- **Setup tag performance** — which setups work best
- **AI pattern detection** — automated pattern recognition
- **AI trade insights** — data-driven improvement suggestions
- **Risk of ruin calculator** — Monte Carlo simulation
- **Weekly/monthly reports** — auto-generated performance summaries

### 📓 Journal
- **Daily journal editor** — pre-market plan, post-market review, lessons learned
- **Mood tracking** — daily emotional state logging
- **Calendar view** — month-at-a-glance P&L heatmap
- **Kanban board** — organize journal entries by status
- **Equity curve** — journal-specific performance visualization
- **Patterns & mistakes tracking** — tag and categorize recurring issues

### 🔍 Studies
- **Chart studies** — document technical analysis with notes, tags, and attachments
- **Category system** — breakout, breakdown, reversal, continuation, etc.
- **Pattern duration tracking** — how long setups take to play out
- **Link studies to trades** — connect analysis to execution
- **Study-to-alert pipeline** — create alerts directly from studies

### 👀 Watchlist
- **Multiple watchlists** — organize symbols into custom lists
- **Real-time prices** — live price updates via data providers
- **Quick-add to trades** — seamless transition from watchlist to trade
- **Notes per symbol** — jot down observations

### 🏢 Fundamentals & Scanners
- **TradingView-powered scanner** — pre-built and custom stock screeners
- **Price-based scanners** — 52W High/Low proximity, ATH/ATL zones, Near Day High/Low
- **Technical scanners** — SMA crossovers, gap ups, RSI overbought/oversold
- **Volume scanners** — volume spike detection
- **Client-side post-filtering** — hybrid approach for complex calculations

### 🤖 Broker Integration (Dhan)
- **OAuth-based connection** — secure Dhan account linking
- **Portfolio sync** — auto-import trades from Dhan
- **Order execution** — place orders directly from TradeBook
- **Trade monitoring** — SL/target hit detection with auto-alerts
- **Price updates** — real-time LTP from Dhan API

### 📱 Telegram Integration
- **Multi-chat support** — route notifications to different Telegram groups
- **Custom bot support** — use your own BotFather-created bot
- **Per-chat configuration** — choose notification types and segments per chat
- **Custom message templates** — define your own message format with `{{variables}}`
- **Delivery log** — full audit trail of sent messages
- **3-tier bot resolution** — per-chat → user default → system fallback
- **Notification types** — new trade, trade closed, alert triggered, EOD report

### 🔐 Authentication & Security
- **Email/password login** with email verification
- **Google OAuth** via Lovable Cloud
- **Row-Level Security (RLS)** — all database tables protected
- **Role-based access** — admin/moderator/user roles
- **Content Security Policy** — strict CSP headers
- **Webhook secret validation** — signed webhook payloads

### ⚙️ Settings & Preferences
- **Profile management** — name, email, phone, referral code
- **Capital management** — track deposits/withdrawals with transaction history
- **Tag management** — custom pattern, mistake, candlestick, and volume tags
- **Notification preferences** — DND mode, quiet hours, digest mode, importance threshold
- **Dashboard layout** — widget visibility, order, and density
- **Theme toggle** — light/dark mode
- **Timezone configuration**
- **AI provider selection**
- **Trailing SL profiles** — reusable TSL configurations
- **Billing & subscription** — plan management with trial support

### 🌐 Public Profiles
- **Shareable trader profile** — public performance page at `/trader/:userId`
- **Monthly stats** — auto-calculated performance metrics
- **Custom disclaimer** — RA/RIA compliance text
- **Privacy controls** — toggle public visibility

### 📤 Sharing
- **P&L share cards** — beautiful social media cards for daily/weekly P&L
- **Trade share cards** — individual trade result cards
- **Streak share cards** — show off winning streaks
- **Multiple templates** — choose from different card designs
- **Export to image** — download as PNG for social media

### 🎯 Other Features
- **Command palette** (`Ctrl+K`) — quick navigation and actions
- **Keyboard shortcuts** — power-user navigation
- **PWA support** — installable on mobile/desktop
- **Offline trade queue** — log trades without internet, sync later
- **CSV export** — download trade data
- **Referral system** — invite friends with unique codes
- **Onboarding wizard** — guided first-time setup
- **Error boundaries** — graceful error handling
- **Page skeletons** — loading states for every page
- **SEO optimized** — meta tags, sitemap, robots.txt, JSON-LD

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State Management** | TanStack React Query |
| **Routing** | React Router v6 |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **Backend** | Lovable Cloud (Supabase) |
| **Database** | PostgreSQL with RLS |
| **Auth** | Supabase Auth (Email + Google OAuth) |
| **Edge Functions** | Deno runtime (serverless) |
| **Drag & Drop** | dnd-kit |
| **PWA** | vite-plugin-pwa |
| **Image Export** | html-to-image + Konva |
| **Markdown** | react-markdown |

---

## 📁 Project Structure

```
src/
├── assets/             # Static images (hero, logo)
├── components/
│   ├── analytics/      # Analytics widgets (win-rate matrix, streaks, etc.)
│   ├── dashboard/      # Dashboard widgets (KPI cards, equity curve, etc.)
│   ├── docs/           # Documentation page components
│   ├── journal/        # Journal editor, calendar, kanban
│   ├── landing/        # Landing page sections
│   ├── layout/         # Sidebar, MainLayout, ProtectedRoute
│   ├── modals/         # Trade detail, create trade, alerts
│   ├── settings/       # Settings panels (profile, billing, telegram)
│   ├── sharing/        # P&L and trade share card generators
│   ├── skeletons/      # Loading skeleton components
│   ├── telegram/       # Delivery log panel
│   ├── trade/          # Trade-specific components (CSV import, position sizing)
│   └── ui/             # shadcn/ui primitives + custom UI components
├── contexts/           # AuthContext, SidebarContext
├── hooks/              # Custom hooks (useTrades, useAlerts, useSubscription, etc.)
├── integrations/       # Supabase client & types (auto-generated)
├── lib/                # Utilities (calculations, formatting, CSV export)
├── pages/              # Route-level page components
└── types/              # TypeScript type definitions

supabase/
├── functions/          # 20+ Edge Functions
│   ├── auto-tag-trade/
│   ├── dhan-auth/
│   ├── dhan-execute/
│   ├── dhan-sync/
│   ├── dhan-verify/
│   ├── eod-report/
│   ├── evaluate-alerts/
│   ├── export-data/
│   ├── generate-weekly-report/
│   ├── get-live-prices/
│   ├── instrument-search/
│   ├── instrument-sync/
│   ├── morning-briefing/
│   ├── pattern-detection/
│   ├── suggest-alerts/
│   ├── telegram-notify/
│   ├── telegram-verify/
│   ├── telegram-webhook/
│   ├── trade-coach/
│   ├── trade-insights/
│   ├── trade-monitor/
│   └── tradingview-scan/
└── migrations/         # Database schema migrations
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm

### Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

---

## 🗄️ Database Schema

The app uses **30+ PostgreSQL tables** with Row-Level Security:

| Table | Purpose |
|-------|---------|
| `trades` | Core trade records with full metadata |
| `trade_events` | Entry/exit/add/partial close events |
| `trade_templates` | Reusable trade configurations |
| `strategy_trades` | Multi-leg options strategies |
| `alerts` | Price/volume/custom alerts |
| `studies` | Technical analysis records |
| `daily_journal_entries` | Daily trading journal |
| `watchlists` / `watchlist_items` | Custom watchlists |
| `user_settings` | Per-user preferences & integrations |
| `telegram_chats` | Multi-chat Telegram config |
| `telegram_delivery_log` | Message delivery audit trail |
| `notifications` | In-app notification system |
| `achievements` / `user_achievements` | Gamification system |
| `subscriptions` | Plan & billing management |
| `profiles` / `public_profiles` | User profile data |
| `instrument_master` | NSE/BSE/MCX instrument catalog |
| `scanner_definitions` / `scanner_results` | Custom stock scanners |
| `trading_rules` | Personal trading rules checklist |
| `capital_transactions` | Deposit/withdrawal tracking |
| `pattern_tags` / `mistake_tags` / `candlestick_tags` / `volume_tags` | Tagging system |
| `referrals` | Referral tracking |
| `user_roles` | Role-based access control |

---

## ⚡ Edge Functions

| Function | Purpose |
|----------|---------|
| `dhan-auth` / `dhan-verify` | Dhan broker OAuth flow |
| `dhan-sync` | Sync portfolio & orders from Dhan |
| `dhan-execute` | Execute orders via Dhan API |
| `trade-monitor` | Monitor SL/target hits in real-time |
| `evaluate-alerts` | Check and trigger price alerts |
| `telegram-notify` | Send Telegram notifications |
| `telegram-verify` / `telegram-webhook` | Telegram bot verification |
| `get-live-prices` | Fetch real-time market prices |
| `instrument-search` / `instrument-sync` | Symbol search & master data sync |
| `tradingview-scan` | TradingView stock screener proxy |
| `trade-coach` | AI-powered trade feedback |
| `trade-insights` | AI trade pattern analysis |
| `pattern-detection` | Automated pattern recognition |
| `suggest-alerts` | AI-recommended alerts |
| `morning-briefing` | Pre-market AI summary |
| `eod-report` | End-of-day performance report |
| `generate-weekly-report` | Weekly summary generation |
| `export-data` | Data export (CSV/JSON) |
| `auto-tag-trade` | AI-powered trade tagging |

---

## 🎨 Design System

- **Theme**: Dark-first with light mode support
- **Brand color**: `#f07020` (warm orange)
- **Typography**: System font stack for performance
- **Component library**: shadcn/ui with custom variants
- **Semantic tokens**: All colors via CSS custom properties (HSL)
- **Responsive**: Mobile-first with bottom navigation on small screens
- **Animations**: Framer Motion page transitions and micro-interactions

---

## 📱 PWA Support

TradeBook is a fully installable Progressive Web App:
- Offline-capable with service worker
- Offline trade queue — log trades without internet
- Add to home screen on iOS/Android
- Native app-like experience

---

## 🔒 Security

- **Row-Level Security** on all tables
- **Content Security Policy** headers
- **SECURITY DEFINER** functions for role checks
- **Webhook secret** validation
- **No client-side admin checks** — all authorization server-side
- **API key isolation** — secrets stored in edge function environment

---

## 📄 License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ for Indian traders by <a href="https://tradebook.mrchartist.com">MrChartist</a>
</p>
