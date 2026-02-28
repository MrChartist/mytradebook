# MyTradeBook — Complete Guide for Traders & Research Analysts

> **The Professional Trading Journal Built for Indian Markets — NSE · BSE · MCX**

---

## Table of Contents

1. [What is MyTradeBook?](#1-what-is-mytradebook)
2. [The Problem It Solves](#2-the-problem-it-solves)
3. [Who is This For?](#3-who-is-this-for)
4. [How the Website Works — From Login to Daily Trading](#4-how-the-website-works--from-login-to-daily-trading)
5. [How It Helps TRADERS](#5-how-it-helps-traders)
   - [Trade Logging & Management](#51-trade-logging--management)
   - [Live Price Tracking](#52-live-price-tracking)
   - [Trailing Stop Loss Engine](#53-trailing-stop-loss-engine)
   - [Multi-Leg Options Strategy Builder](#54-multi-leg-options-strategy-builder)
   - [Trade Templates](#55-trade-templates)
   - [Bulk Trade Operations](#56-bulk-trade-operations)
6. [How It Helps RESEARCH ANALYSTS (RAs)](#6-how-it-helps-research-analysts-ras)
   - [Studies & Research Notes](#61-studies--research-notes)
   - [RA Compliance Mode](#62-ra-compliance-mode)
   - [Sharing Alerts with Clients via Telegram](#63-sharing-alerts-with-clients-via-telegram)
   - [Weekly Reports for Clients](#64-weekly-reports-for-clients)
   - [Watchlist Management](#65-watchlist-management)
7. [The Alert System — Explained in Full Detail](#7-the-alert-system--explained-in-full-detail)
   - [Types of Alerts](#71-types-of-alerts)
   - [Alert Recurrence & Cooldown](#72-alert-recurrence--cooldown)
   - [Telegram Notification Delivery](#73-telegram-notification-delivery)
   - [Chain Alerts](#74-chain-alerts)
   - [Alert Evaluation Engine](#75-alert-evaluation-engine)
   - [Morning Briefing & EOD Report](#76-morning-briefing--eod-report)
8. [The Journal System — Explained in Full Detail](#8-the-journal-system--explained-in-full-detail)
   - [Journal Dashboard](#81-journal-dashboard)
   - [Equity Curve](#82-equity-curve)
   - [Calendar View](#83-calendar-view)
   - [Kanban Board](#84-kanban-board)
   - [Patterns & Mistakes](#85-patterns--mistakes)
   - [Performance Tables](#86-performance-tables)
9. [Analytics — Deep Performance Insights](#9-analytics--deep-performance-insights)
10. [Reports — Weekly Summaries](#10-reports--weekly-summaries)
11. [Mistakes Tracker](#11-mistakes-tracker)
12. [Broker Integration (Dhan)](#12-broker-integration-dhan)
13. [Telegram Integration](#13-telegram-integration)
14. [Settings & Customization](#14-settings--customization)
15. [The Full Daily Workflow](#15-the-full-daily-workflow)

---

## 1. What is MyTradeBook?

**MyTradeBook** (publicly branded as **TradeBook**) is a web-based, all-in-one **trading journal and alert management platform** built specifically for Indian financial markets — covering **NSE (Equity + F&O)**, **BSE**, and **MCX (Commodities)**.

It is not a broker. It does not execute trades on its own. It is a **companion tool** that sits alongside your broker and helps you:

- **Record** every trade you take — manually or by auto-syncing from Dhan broker
- **Monitor** live prices and open positions in real time
- **Alert** you instantly via Telegram when prices hit your levels
- **Analyse** your trading performance with professional-grade statistics
- **Review** your past trades via a rich, filterable journal
- **Learn** from your mistakes by tagging errors and studying patterns
- **Report** weekly results to yourself (or your clients, if you are an RA)

The app targets **all experience levels** — from a part-time retail trader wanting to track 5 trades a month, to a professional research analyst managing 50+ alerts per day across multiple segments.

---

## 2. The Problem It Solves

Most Indian traders face these exact problems every day:

| Problem | How TradeBook Solves It |
|---|---|
| "I forgot to set a stop loss alert" | Set price alerts with Telegram delivery — never miss a level |
| "I don't know if my intraday or swing trades are more profitable" | Segment-based analytics show exact P&L per strategy type |
| "I keep making the same mistakes" | Mistake tagging + frequency analysis reveals your patterns |
| "I have to stare at the screen all day" | TSL automation + alerts watch your trades for you |
| "I have no idea what my actual win rate is" | Journal and Analytics compute it automatically from all your trades |
| "I forget to review my week" | Auto-generated weekly reports, delivered to Telegram every weekend |
| "My broker app shows orders, not trade analysis" | TradeBook syncs your orders and converts them into analysed trades |
| "I want to send trade alerts to my clients" | Multi-destination Telegram routing with RA compliance mode |
| "I have no system, I trade on feel" | Pre-trade checklist, rules engine, and discipline enforcement tools |

---

## 3. Who is This For?

### For Traders

| Trader Type | Benefit |
|---|---|
| **Equity Intraday** | Log morning entries, track live LTP, get SL alerts, see end-of-day P&L |
| **Equity Swing / Positional** | Track multi-day setups, get price target alerts, review week-by-week |
| **Options Trader** | Multi-leg strategy builder, segment analytics for Options separately |
| **Futures Trader** | Lot-size aware trade logging, futures-specific segment analytics |
| **Commodity (MCX) Trader** | MCX segment support across Gold, Silver, Crude, etc. |
| **Beginner Trader** | Forced discipline — log every trade, review mistakes, build consistency |

### For Research Analysts (RAs)

| RA Use Case | Benefit |
|---|---|
| **Publishing Calls** | Log every call as a trade/study with entry, SL, targets |
| **Price Alerts for Calls** | Set alerts for all published levels — know instantly when triggered |
| **Client Notifications** | Deliver Telegram alerts to multiple client groups simultaneously |
| **Compliance Mode** | RA disclaimer in all messages, disclaimers on public-facing content |
| **Weekly Performance Reports** | Auto-generate and send weekly call performance to subscribers |
| **Research Notes** | Studies section to document sector views, stock analysis, macro notes |

### For Trading Desks / Groups

- **Team plan** supports 5 members with shared studies and alerts
- Shared watchlists and shared alert monitoring
- API access for custom integrations

---

## 4. How the Website Works — From Login to Daily Trading

Here is the complete flow of using TradeBook, from the very first visit to everyday use:

```
Step 1 — Visit the Website
    ↓
    Landing Page (/landing)
    → See features, pricing, and dashboard preview
    → Click "Get Started"
    ↓
Step 2 — Sign Up / Login (/login)
    → Email + Password  OR  Google OAuth (one click)
    → Account created instantly via Supabase Auth
    ↓
Step 3 — First-Time Setup (Settings page)
    → Set your starting capital (for P&L % calculations)
    → Set your default stop-loss % (auto-fills in trade form)
    → Connect Dhan broker (for live prices + portfolio sync)
    → Connect Telegram bot (for instant alert notifications)
    → Create your custom setup tags and mistake tags
    ↓
Step 4 — Daily Routine
    Morning:
    → Receive Morning Briefing on Telegram
       (open positions, active alerts, today's expiring alerts, recent research)
    → Review Dashboard — check open trades, active alerts
    → Add new planned trades (PENDING status)
    → Set price alerts for your levels

    During Market Hours:
    → Price alerts trigger → Telegram notification received
    → Open positions tracked with live LTP on Dashboard and Trades page
    → TSL (trailing stop loss) engine monitors your positions automatically
    → Log new trade entries as they happen

    After Market Close:
    → Receive End-of-Day report on Telegram
       (today's P&L, trades taken, mistakes flagged)
    → Close trades with exit price
    → Add post-trade notes, rating, and mistake tags
    → Review Journal for patterns

    Every Weekend:
    → Receive Weekly Report on Telegram
       (segment-wise P&L, win rate, top setups, common mistakes)
    → Review Analytics page for deeper insights
    → Update Studies with new research
```

---

## 5. How It Helps TRADERS

### 5.1 Trade Logging & Management

Every trade starts on the **Trades page** (`/trades`). You can add a trade in two ways:

**Manual Entry (Create Trade Modal):**
- Search for any instrument from the 50,000+ NSE/BSE/MCX scrip master
- Choose the segment: Intraday, Positional, Futures, Options, or Commodities
- Enter direction (BUY / SELL), quantity, entry price
- Enter stop loss and up to multiple target prices (T1, T2, T3...)
- Add pre-trade notes, select your setup tags (e.g., "Breakout", "Flag Pattern", "EMA Crossover")
- Rate your confidence level (1–5)
- Upload a chart screenshot as evidence/reference
- Status starts as **PENDING** (planned trade) and moves to **OPEN** when you enter

**Auto-Import from Dhan:**
- Click the "Sync" button on the Trades page
- TradeBook fetches all your orders from Dhan's API
- Automatically matches BUY and SELL pairs to form complete trades
- Calculates P&L for each pair
- Creates trade records in your journal automatically
- You then review, add notes, and tag setups/mistakes

**Trade Statuses:**
| Status | Meaning |
|---|---|
| **PENDING** | Planned trade not yet entered (idea, watchlist entry) |
| **OPEN** | Currently in the market |
| **CLOSED** | Exited — P&L calculated |
| **CANCELLED** | Plan abandoned, never entered |

**Filtering & Sorting:**
- Filter by status (Planned / Open / Closed / Cancelled)
- Filter by segment (All / Intraday / Positional / Futures / Options / Commodities)
- Search by symbol name
- Sort by Latest, Highest P&L, Lowest P&L, Symbol A–Z
- Toggle between List view and Grid (card) view

**Trade Stats Bar:**
At the top of the Trades page, five clickable stat cards show:
- **Total P&L** across all filtered trades
- **Open positions** count (click to filter to OPEN)
- **Planned trades** count (click to filter to PENDING)
- **Closed today** count
- **Win Rate** % with live LTP timestamp

Each card is clickable — clicking it instantly applies that filter to the trade list below.

---

### 5.2 Live Price Tracking

When you have **OPEN** trades and a connected Dhan account:

- TradeBook polls Dhan's market data endpoint every **30 seconds**
- Each open trade's card shows the current **LTP (Last Traded Price)**
- Shows the **day change %** (e.g., +1.4% or -0.8%)
- The Dashboard's Positions Table shows all open trades with live LTP
- A **"Live"** badge with a pulsing animation appears when prices are being updated
- The last update time is displayed (e.g., "2:47 PM")
- Your unrealized P&L updates in near-real-time based on live prices

This means you can **leave the app open on a second screen or phone** and see your portfolio moving in real time without being glued to your broker's terminal.

---

### 5.3 Trailing Stop Loss Engine

The **TSL (Trailing Stop Loss) engine** is one of the most powerful features for active traders. It runs automatically via a backend Edge Function (`trade-monitor`).

**How it works:**
1. You configure TSL parameters for a trade (activation price, step size, gap)
2. As price moves in your favour, the stop loss automatically trails upward (for longs) or downward (for shorts)
3. The engine checks every few minutes and adjusts your stop loss level
4. When price reverses and hits the trailing stop, a Telegram notification is sent immediately
5. You can optionally auto-execute the close via Dhan API

**Use case example:**
You buy RELIANCE at ₹2800 with a stop at ₹2760. You set a TSL that activates at ₹2850, trails by ₹30 with a cooldown of 5 minutes. As RELIANCE rises to ₹2900, your stop automatically moves to ₹2870. If it falls back to ₹2870, you get a Telegram alert and the position can be closed automatically — locking in profit without you watching the screen.

**Configurable TSL parameters:**
- Activation price (minimum price move before TSL starts)
- Trail amount (fixed ₹ or % gap behind price)
- Step size (minimum price change to move the stop)
- Cooldown period (prevent whipsaws)
- Segment-specific settings (different TSL rules for Intraday vs Positional)

---

### 5.4 Multi-Leg Options Strategy Builder

For options traders, TradeBook includes a **Multi-Leg Strategy Modal** accessible from the Trades page.

This lets you create complex strategies as a single unit:
- **Straddle** (Buy ATM CE + Buy ATM PE)
- **Strangle** (Buy OTM CE + Buy OTM PE)
- **Bull Call Spread** (Buy CE + Sell higher CE)
- **Bear Put Spread** (Buy PE + Sell lower PE)
- **Iron Condor** and other multi-leg structures

Each leg has its own symbol, direction, strike, expiry, lot size, and entry price. The strategy is tracked as a whole — the combined P&L, combined max loss, and combined max profit are displayed together.

This solves the problem of having 4 different legs showing as 4 unrelated trades in your journal — instead they appear as one logical strategy.

---

### 5.5 Trade Templates

If you frequently trade the same type of setup with similar parameters (e.g., every intraday breakout gets a 2% SL and your standard lot size), you can save that as a **Trade Template**.

- Create a template with pre-filled: segment, direction, quantity, SL%, setup tags
- Access templates from the "Templates" dropdown on the Trades page
- Select a template → it pre-fills the Create Trade form
- Change only what is different for today's specific trade (the symbol, price levels)

This saves time and ensures consistency — you always follow your own rules rather than ad-hoc entries.

---

### 5.6 Bulk Trade Operations

When managing many open positions at once, TradeBook's **Bulk Mode** lets you:

1. Click the "Bulk" button on the Trades page
2. Select multiple trades using checkboxes
3. **Bulk Cancel** — mark all selected as CANCELLED in one click
4. **Bulk Close at Market** — close all selected OPEN positions at the current LTP from Dhan in one click

This is useful for:
- Clearing all intraday positions at end of day
- Cancelling all planned trades if market direction changes drastically
- Emergency exit from multiple positions

---

## 6. How It Helps RESEARCH ANALYSTS (RAs)

Research Analysts have a unique need: they not only trade themselves, but they **publish trading calls to subscribers** and must track the performance of those calls, often with compliance requirements.

TradeBook is specifically built with RA use cases in mind.

### 6.1 Studies & Research Notes

The **Studies page** (`/studies`) is a dedicated research notebook for RAs and analysts.

**What you can write:**
- A full stock analysis (technical, fundamental, news-based, sentiment)
- A sector thesis or macro note
- A pre-trade idea before it becomes an actual trade
- A market event analysis (budget, RBI policy, earnings)

**Study fields:**
- **Title** — Name of the idea or study
- **Symbol** — The stock/instrument the study is about (optional, can be a sector view)
- **Category** — Technical / Fundamental / News / Sentiment / Other
- **Status** — Draft → Active → Triggered (when target hit) → Invalidated → Archived
- **Notes / Content** — Rich text notes, analysis, reasoning
- **Tags** — Custom tags for searching and filtering
- **Attachments** — Upload PDFs, images, chart screenshots, research reports
- **Analysis Date** — When the study was written

**How RAs use this:**
- Write a study for each stock on your radar
- Set status to "Active" when you publish the call
- Change to "Triggered" when the target is hit (with proof)
- Archive or mark "Invalidated" when the setup fails
- Build a historical record of your research quality over time

Studies also feed into the **Morning Briefing** Telegram message — any studies with today's analysis date are included, so your morning message highlights which ideas are actionable today.

---

### 6.2 RA Compliance Mode

TradeBook has a dedicated **RA Compliance Mode** (Team plan) designed for SEBI-registered Research Analysts who need to follow SEBI RA regulations.

**Features:**
- **Disclaimer on all outgoing messages** — Every Telegram alert and report automatically appends a SEBI-mandated disclaimer at the bottom
- **Public Mode** — A read-only version of performance data that can be shared with subscribers without revealing private P&L details
- **RA Disclaimer text** — Configurable legal text appended to all communications
- **Audit trail** — All trade records and studies are logged with timestamps for compliance purposes

This ensures that an SEBI-registered RA can use TradeBook as their primary CRM and call-tracking system while remaining compliant with regulations.

---

### 6.3 Sharing Alerts with Clients via Telegram

This is one of the most powerful features for RAs. TradeBook lets you **route alert notifications to different Telegram groups** based on segment.

**Example setup for an RA:**
- Connect 5 Telegram chat destinations:
  - `Intraday_Calls_Group` → receives only Equity Intraday alerts
  - `Options_Premium_Group` → receives only Options alerts
  - `Swing_Calls_Group` → receives only Positional alerts
  - `MCX_Calls_Group` → receives only Commodities alerts
  - `Personal_Alerts` → receives everything

Each `telegram_chats` record has:
- A specific chat ID (your client group)
- A custom bot token (your own branded bot, if desired)
- Selected segments it should receive
- Notification types: alerts, EOD reports, weekly reports, morning briefing

**When an alert triggers:**
1. `evaluate-alerts` Edge Function detects the condition is met
2. Checks which Telegram destinations are configured for this user and segment
3. Sends a formatted message to EACH matching destination simultaneously
4. The message includes: Symbol, condition, price at trigger, time, your configured disclaimer (for RAs)

**Example Telegram alert message (what your clients see):**
```
🔔 ALERT TRIGGERED

📈 RELIANCE
Condition: Price Crossed Above ₹2,850
Current LTP: ₹2,853.45
Time: 10:32 AM IST

📝 Note: Breakout above resistance — T1: ₹2,950 | SL: ₹2,800

⚠️ Disclaimer: This is for educational purposes only. Not SEBI investment advice.
```

This means an RA can manage ALL their call alerts in TradeBook, and clients receive them instantly on Telegram — without the RA having to manually send messages to each group.

---

### 6.4 Weekly Reports for Clients

Every week, TradeBook automatically generates a **Weekly Performance Report** via the `generate-weekly-report` Edge Function.

**What the report contains:**
- Total P&L for the week
- Total number of calls/trades
- Overall win rate
- Breakdown **per segment** (Equity Intraday, Positional, Futures, Options, Commodities):
  - Trades taken in each segment
  - Win rate in each segment
  - Average gain per winning trade
  - Average loss per losing trade
  - Best trade of the week
  - Worst trade of the week
  - Top working setups (e.g., "Breakout: 4 times")
  - Most common mistakes (e.g., "Early exit: 2 times")

**Delivery:**
- Viewable on the Reports page in the app
- One-click "Send to Telegram" button to push to any configured chat
- Auto-delivery configured per Telegram chat (which segments' reports each chat receives)

**For RAs:** This is the weekly scorecard you can share with premium subscribers — showing them your call performance transparently and professionally. It builds trust and accountability.

---

### 6.5 Watchlist Management

The **Watchlist page** (`/watchlist`) lets RAs and traders organise instruments into named lists.

**Features:**
- Create multiple watchlists (e.g., "Breakout Candidates", "Sector: Banking", "Weekly Options Plays")
- Search and add any of 50,000+ NSE/BSE/MCX instruments to any watchlist
- Each instrument shows live LTP and day change % (pulled from Dhan every 30s)
- Sort watchlist items by % Change, Volume, LTP, or Alphabetically
- Click any instrument to instantly:
  - **Create an Alert** for that instrument (pre-fills the symbol)
  - **Create a Trade** for that instrument (pre-fills the symbol and exchange)
- Colour-code your watchlists with 10 available colours
- Add notes per watchlist

**For RAs:** Your watchlists become your "call pipeline" — instruments you are analysing or considering for upcoming calls. The live LTP helps you monitor price movement without switching to your broker's app.

---

## 7. The Alert System — Explained in Full Detail

The alert system is the **real-time intelligence layer** of TradeBook. It monitors price conditions 24/7 (or only during market hours, if configured) and delivers instant notifications via Telegram.

### 7.1 Types of Alerts

TradeBook supports 8 different alert condition types:

| Condition | When it Triggers | Use Case |
|---|---|---|
| **Price Above** (PRICE_GT) | LTP rises above a fixed price | "Alert me when NIFTY crosses 24,500" |
| **Price Below** (PRICE_LT) | LTP falls below a fixed price | "Alert me if HDFC Bank falls below 1,600 (SL hit)" |
| **Crosses Above** (PRICE_CROSS_ABOVE) | LTP crosses upward through the exact level | Breakout detection — triggers only once when price moves through |
| **Crosses Below** (PRICE_CROSS_BELOW) | LTP crosses downward through the level | Breakdown detection — supports, necklines |
| **% Change Up** (PERCENT_CHANGE_GT) | Stock moves up X% intraday | "Alert me when any stock moves +3% from open" |
| **% Change Down** (PERCENT_CHANGE_LT) | Stock falls X% intraday | "Alert me when a stock falls -2% from open" |
| **Volume Spike** (VOLUME_SPIKE) | Volume exceeds a threshold | Unusual activity detection |
| **Custom** (CUSTOM) | User-defined text condition | For manual reference or future custom logic |

**Cross detection** (PRICE_CROSS_ABOVE / PRICE_CROSS_BELOW) is especially powerful because:
- It uses `previous_ltp` from the last evaluation to detect direction of price movement
- A "Price Above" alert fires every evaluation cycle if price is still above
- A "Cross Above" alert fires **only once** when price moves through the level
- This prevents spam notifications when price hovers around a level

---

### 7.2 Alert Recurrence & Cooldown

Each alert has a **Recurrence** setting:

| Recurrence | Behaviour |
|---|---|
| **ONCE** | Fires once, then automatically deactivates. Use for one-time price levels. |
| **DAILY** | Fires once per trading day. Resets at midnight for the next session. Use for daily levels. |
| **CONTINUOUS** | Fires every time condition is met (subject to cooldown). Use for ongoing monitoring. |

**Cooldown:** Prevents a CONTINUOUS alert from firing too frequently. For example, a cooldown of 30 minutes means even if NIFTY bounces around your level 10 times in an hour, you only get 2 notifications — not 10.

**Snooze:** Temporarily pause an alert until a specific future time (e.g., "Don't alert me again until 2 PM"). Useful when you are in a meeting or away from the market and don't want noise.

**Active Hours Only:** If enabled, the alert is only evaluated between 9:15 AM and 3:30 PM IST — no alerts during pre-market or after-hours. This prevents false triggers from block deals or grey market prices.

**Expiry Date:** Set an alert to automatically expire after a date (e.g., set a weekly options alert that expires on expiry day).

---

### 7.3 Telegram Notification Delivery

When an alert triggers, the `telegram-notify` Edge Function is called and sends a rich Telegram message.

**The message contains:**
- Symbol name
- What condition was triggered (e.g., "Crossed Above ₹24,500")
- The actual LTP at the time of trigger
- The exact timestamp
- Any notes you attached to the alert (e.g., "This is the key resistance — decide on entry here")
- RA disclaimer (if RA mode enabled)

**Delivery routing:**
- Sent to your primary Telegram chat (personal)
- Also sent to any configured `telegram_chats` that match the alert's symbol segment

You can use a **custom bot token** per Telegram destination — so your "NIFTY Options Group" receives alerts from your branded bot (e.g., "📢 XYZ Research Bot"), not the generic TradeBook bot.

---

### 7.4 Chain Alerts

A powerful feature for complex setups — when one alert triggers, it can automatically **create a new alert** (the "chain").

**Use case example:**
- Alert 1: "RELIANCE crosses above ₹2,850" (breakout confirmation)
- When Alert 1 triggers, Alert 2 is automatically created: "RELIANCE falls below ₹2,820" (stop loss alert)
- You entered on the breakout and now have an automatic SL alert — without any manual action

This allows you to set up conditional alert sequences in advance:
- Breakout trigger → auto-create stop loss alert
- Target 1 hit → auto-create target 2 alert
- Volume spike → auto-create price alert for entry

Chain alerts are stored as a `chain_children` JSONB field on the parent alert — the `evaluate-alerts` function reads this and creates child alerts when the parent fires.

---

### 7.5 Alert Evaluation Engine

The backend `evaluate-alerts` Edge Function is the heart of the alert system.

**It runs every 5 minutes** (cron schedule) and does the following:

```
1. Fetch all active alerts from database (across all users)

2. Group alerts by user_id

3. For each user:
   a. Fetch user's Dhan credentials from user_settings
   b. Build a list of symbols/security_ids needing price data
   c. Fetch live LTP from Dhan API for all those symbols in one batch request
   d. For each alert:
      - Check the condition type
      - Compare current LTP against threshold
      - For cross alerts: compare with previous_ltp to detect direction
      - If condition is MET:
        * Mark alert as triggered (update trigger_count, last_triggered)
        * For ONCE alerts: set active = false
        * For DAILY alerts: schedule next reset
        * Send Telegram notification
        * Create chain alerts if configured
        * Update previous_ltp for next evaluation

4. Log results and errors
```

**Why every 5 minutes?** This is a balance between timeliness and API cost. For faster response, you can adjust `check_interval_minutes` per alert — some high-priority alerts can be set to check every minute, while low-priority alerts every 15 minutes.

**What if Dhan is not connected?** Price data is not fetched and alerts are skipped for that user. The system logs a note. You need Dhan connected for real-time alert evaluation.

---

### 7.6 Morning Briefing & EOD Report

Two automated Telegram messages are sent every day to keep you informed:

#### Morning Briefing (before market opens)

The `morning-briefing` Edge Function runs on a cron schedule before market hours and sends to **every user who has Telegram enabled**.

**What it contains:**
```
☀️ MORNING BRIEFING
📅 Monday, 28 Feb 2026

📊 Open Positions (3)
🟢 RELIANCE | BUY | 10 shares | Entry: ₹2,800 | SL: ₹2,750 | T1: ₹2,950
🔴 NIFTY 25000PE | SELL | 1 lot | Entry: ₹120 | SL: ₹160
🟢 HDFCBANK | BUY | 25 shares | Entry: ₹1,650 | SL: ₹1,610

🔔 Active Alerts (5)
→ TATAMOTORS: Price Above ₹900
→ NIFTY: Crosses Above 24,500
→ INFY: % Change Down -2%
... (up to 10 alerts shown)

⏳ Expiring Alerts Today (1)
→ NIFTY 24500CE: Crosses Above ₹80

📝 Today's Research Notes (2)
→ RELIANCE: Watching for breakout above ₹2,850
→ BANKEX: Bullish on dip to support zone
```

This message ensures you start the day aware of:
- All positions that need monitoring
- All active price levels to watch
- Any alerts that expire today (requiring renewal)
- Any research ideas you had scheduled for today

#### End-of-Day (EOD) Report (after market close)

The `eod-report` Edge Function runs after 3:30 PM IST and sends a segment-wise summary:

```
📊 END OF DAY REPORT
📅 Monday, 28 Feb 2026

EQUITY INTRADAY
→ Trades: 3 | P&L: +₹4,200 | Win Rate: 67%
→ Best: RELIANCE +₹3,100 | Worst: NIFTY -₹800

OPTIONS
→ Trades: 2 | P&L: -₹1,500 | Win Rate: 50%
→ Best: NIFTY CE +₹200 | Worst: NIFTY PE -₹1,700

📈 Day Total P&L: +₹2,700
```

This message is sent to each configured Telegram chat destination, filtered by which segments that chat is subscribed to. An Options-only subscriber only sees the Options section.

---

## 8. The Journal System — Explained in Full Detail

The **Journal page** (`/journal`) is your retrospective performance review tool. Unlike the Trades page (which is operational — adding, closing, managing), the Journal is about **learning from history**.

### 8.1 Journal Dashboard

The default tab shows a **high-level scorecard** for the selected time period:

**Summary Cards:**
| Card | What it shows |
|---|---|
| Total P&L | Cumulative profit/loss in ₹ |
| Total Trades | Number of trades in period |
| Win Rate | % of trades that were profitable |
| Avg Win | Average profit on winning trades |
| Avg Loss | Average loss on losing trades |
| Profit Factor | Total gross profit ÷ total gross loss (>1 = positive expectancy) |
| Expectancy | Average P&L per trade (shows if your system makes money per trade) |
| Max Drawdown | Largest peak-to-trough loss in the period |

**Filters:**
- **Segment filter** — View metrics for one segment at a time (e.g., "How did I do only in Options this month?")
- **Date range** — Last 30, 60, 90 days, or a custom date range with a date picker

These filters are global for the journal page — all tabs (equity curve, performance tables, patterns) update when you change the filter.

---

### 8.2 Equity Curve

The Equity Curve tab shows a line chart of your cumulative P&L over time.

**What you see:**
- A green/red line showing your account growth from your starting capital
- The X-axis is dates, Y-axis is cumulative P&L in ₹
- A shaded area below showing the **drawdown** — how far below the peak your account has fallen at each point
- Horizontal reference lines for breakeven and starting capital

**Why this matters:**
- A smooth, upward equity curve = consistent trading
- A zigzag curve = inconsistent, needs review
- Deep drawdown periods reveal when your strategy stops working (e.g., always drawdown during a specific market condition)
- You can visually identify if you traded well in Jan but terribly in Feb — then investigate why

---

### 8.3 Calendar View

The Calendar View shows a **heat-map calendar** where each day is colour-coded:

| Colour | Meaning |
|---|---|
| **Deep Green** | Large profit day |
| **Light Green** | Small profit day |
| **Gray** | No trades / market holiday |
| **Light Red** | Small loss day |
| **Deep Red** | Large loss day |

**Each day cell shows:**
- Date number
- Net P&L for the day
- Number of trades taken

**Click any day** to see a popup with:
- All trades taken that day
- P&L per trade
- Click any trade to open the full Trade Detail modal

**What RAs and traders learn from the calendar:**
- Do you lose money consistently on Mondays?
- Do you overtrade on Wednesdays?
- Is there a cluster of red days after each expiry week?
- Are your losses concentrated in specific weeks or months?

The calendar reveals these patterns visually, which tables and numbers alone cannot show as clearly.

---

### 8.4 Kanban Board

The Kanban Board tab shows all trades organised into columns by status:

```
| PENDING          | OPEN             | CLOSED           | CANCELLED        |
|------------------|------------------|------------------|------------------|
| TATAMOTORS       | RELIANCE         | HDFCBANK         | INFY             |
| BUY @ ₹850       | BUY @ ₹2,800     | P&L: +₹1,200     | Plan abandoned   |
| SL: ₹820         | LTP: ₹2,863      |                  |                  |
| T1: ₹920         | Unrealized:+₹630 |                  |                  |
```

You can **drag and drop** trades between columns to change their status. For example:
- Drag a PENDING trade to OPEN when you enter it
- Drag an OPEN trade to CLOSED when you exit

This gives a **visual trade management board** — useful when you have 10–20 trades in different stages and want a quick visual overview.

---

### 8.5 Patterns & Mistakes

This tab shows two critical analyses:

**Top Performing Setups:**
A table showing which setup tags (e.g., "Breakout", "Gap Up Entry", "EMA Crossover") have the best win rate and average P&L.

| Setup | Trades | Win Rate | Avg P&L |
|---|---|---|---|
| Breakout | 12 | 75% | +₹1,800 |
| Mean Reversion | 8 | 62.5% | +₹950 |
| News Play | 5 | 40% | -₹200 |
| FOMO Entry | 3 | 0% | -₹2,100 |

This tells you exactly which setups to **do more of** and which to **stop taking**.

**Most Common Mistakes:**
A table showing which mistake tags you've logged most frequently:

| Mistake | Count | Avg P&L Impact |
|---|---|---|
| Chased Entry | 5 | -₹1,400 |
| Moved SL | 4 | -₹2,200 |
| Oversize Position | 3 | -₹3,500 |
| Early Exit | 7 | -₹800 (opportunity cost) |

This shows you where **process failures** are costing you the most money.

---

### 8.6 Performance Tables

Tabular breakdowns of performance by:
- **Symbol** — Which stocks make you the most money?
- **Segment** — Are you better in Intraday or Positional?
- **Setup Tag** — Which setups are your edge?
- **Day of Week** — Do you perform better on certain days?

Each table is sortable and shows: trade count, win rate, total P&L, avg P&L, best trade, worst trade.

---

## 9. Analytics — Deep Performance Insights

The **Analytics page** (`/analytics`) is a dedicated deep-dive into quantitative performance metrics. While the Journal is about reviewing what happened, Analytics is about understanding **why** and **when** you make and lose money.

### Key Metrics Explained

| Metric | Formula | What it Means |
|---|---|---|
| **Win Rate** | Wins ÷ Total Trades × 100 | % of trades that made money. 50%+ is needed for a positive P&L with equal win/loss sizes |
| **Profit Factor** | Total Wins ÷ Total Losses | > 1.0 = profitable system. > 1.5 = strong edge. < 1 = losing money overall |
| **Expectancy** | Total P&L ÷ Total Trades | Average P&L per trade. Positive = your system works on average |
| **Avg Win** | Total Win P&L ÷ Win Count | Average profit on each winning trade |
| **Avg Loss** | Total Loss P&L ÷ Loss Count | Average loss on each losing trade |
| **Win:Loss Ratio** | Avg Win ÷ Avg Loss | How much bigger your wins are vs losses. 2:1 means you can win 33% of trades and still profit |
| **Max Drawdown** | Largest peak-to-trough % drop | Worst losing streak — tells you how much pain to expect |

### Time of Day Analysis

A heatmap/bar chart showing which **hour of the trading day** you are most and least profitable.

**Common findings traders discover:**
- "I make money between 9:15–10:30 AM but lose money in afternoon sessions"
- "My best setups happen in the first 30 minutes when volatility is highest"
- "I overtrade after 2:30 PM trying to recover losses"

Using this, a trader can decide to only trade in their profitable hours and simply stop trading in losing time slots.

### Day of Week Analysis

A bar chart showing performance on Monday, Tuesday, Wednesday, Thursday, Friday.

**Common findings:**
- "I lose money consistently on Mondays (market gap up/down adjustment)"
- "My best days are Wednesday and Thursday"
- "Friday FOMO trades lose money — I should stop trading on Fridays"

### Streak Tracker

Shows:
- Current win/loss streak
- Maximum consecutive wins (best hot streak)
- Maximum consecutive losses (worst losing streak)
- Average streak length

This helps traders understand their **emotional cycles** — if you lose 5 in a row, should you stop trading for the day? The tracker helps you define your own rules (e.g., "Stop after 3 consecutive losses").

### Segment Performance

Bar chart comparing all 5 segments:
- Win rate by segment
- Total P&L by segment
- Average P&L per trade by segment
- Trade count by segment

**Most common revelation for traders:** "I thought Options was my best segment, but actually my Positional Equity trades have a higher profit factor and lower drawdown. Options is where I lose the most."

### Risk/Reward Analytics

Shows the distribution of your actual R:R achieved vs your planned R:R:
- How often you stick to your planned targets
- How often you exit early (cutting winners short)
- How often you hold past your stop (letting losers run)

---

## 10. Reports — Weekly Summaries

The **Reports page** (`/reports`) shows all your historical weekly performance reports.

**Each weekly report card shows:**
- Week date range (e.g., "Feb 17–21, 2026")
- Total trades for the week
- Total P&L for the week
- Overall win rate
- Segment breakdown (collapsed/expandable)

**Segment breakdown per report:**
- Trades in that segment
- Win rate
- P&L
- Best and worst trade

**Actions on each report:**
- **Send to Telegram** — Push this week's report to any of your configured Telegram chats
- **Generate New Report** — Manually trigger the weekly report computation for the current or recent week

**Auto-generation:** The `generate-weekly-report` Edge Function runs every Monday morning and generates the prior week's report automatically. You don't need to remember — it's always waiting for you on Monday.

**For RAs:** The weekly report is the key accountability document. Share it with your premium subscribers every week to show your call performance transparently. The segment breakdown lets Options subscribers see only their relevant performance.

---

## 11. Mistakes Tracker

The **Mistakes page** (`/mistakes`) is a behavioural analysis tool focused exclusively on process failures.

**How mistakes are logged:**
1. When closing or reviewing a trade, you tag it with one or more mistake tags
2. Custom mistake tags are created in Settings > Tags (e.g., "Chased Entry", "No SL", "FOMO", "Moved SL", "Oversize", "Early Exit", "Ignored Signal", "Traded News")

**What the Mistakes page shows:**

**Top Mistakes Table:**
All mistake tags ranked by:
- Frequency (how many times you made this mistake)
- Total P&L impact (how much money this mistake cost you)
- Trend (getting better or worse this month vs last month)

**Mistake vs Trade P&L Correlation:**
For each mistake tag, shows the average P&L on trades where that mistake was tagged — proving with data that the mistake is actually costing money (or sometimes showing it's harmless).

**Month-over-Month trend:**
Shows if your mistake frequency is improving. For example:
- January: Moved SL — 8 times
- February: Moved SL — 3 times
→ You are improving!

**Why this is powerful:**
Most traders know their mistakes intellectually but keep repeating them emotionally. Seeing quantified data — "Moving my SL has cost me ₹18,000 this month across 5 trades" — is far more impactful than a vague feeling. It transforms behavioural change from intention to necessity.

---

## 12. Broker Integration (Dhan)

Dhan is an Indian discount broker. TradeBook integrates deeply with Dhan's API to provide:

### What Dhan Integration Enables

| Feature | How Dhan Powers It |
|---|---|
| **Live LTP** | Real-time prices for open trades and watchlists |
| **Portfolio Sync** | Auto-import your orders as structured trades |
| **Order Execution** | Place buy/sell orders directly from TradeBook |
| **TSL Automation** | Monitor positions and trigger close orders via Dhan |
| **Alert Evaluation** | Fetch live prices for alert condition checking |

### How to Connect Dhan

1. Go to **Settings > Integrations**
2. Click **"Connect Dhan"**
3. Enter your Dhan Client ID and Access Token (from Dhan's developer portal)
4. TradeBook verifies the credentials by making a test API call
5. Once verified, all features are unlocked

**Security:** Your Dhan access token is stored encrypted in the database. It is only ever used server-side inside Edge Functions — it is never exposed to the browser or sent to any third party.

**Token refresh:** Dhan tokens expire. TradeBook tracks the expiry date and warns you when it's time to refresh. You can update your token from Settings at any time.

### Syncing Portfolio from Dhan

Click the **"Sync"** button on the Trades page:

1. TradeBook calls the `dhan-sync` Edge Function
2. Fetches all your recent orders from Dhan API
3. Matches BUY and SELL orders for the same symbol to form complete trades
4. Calculates P&L = (Exit Price - Entry Price) × Quantity × Direction
5. Creates trade records in TradeBook's database
6. Returns a summary: "Synced 12 trades — 8 new, 4 updated"

After syncing, you review the imported trades and add:
- Setup tags
- Notes
- Mistake tags
- Rating
- Chart screenshots

---

## 13. Telegram Integration

Telegram is the **notification delivery layer** of TradeBook. All alerts, reports, and daily briefings are sent via Telegram.

### Why Telegram?

- **Instant delivery** — Messages arrive within seconds of an alert triggering
- **Free** — No SMS cost
- **Rich formatting** — Bold, italic, emojis, structured data
- **Group support** — Send to personal chat, private groups, or channels
- **Bot ecosystem** — Create your own branded bot for clients

### Setting Up Telegram

1. Create a Telegram bot via **@BotFather** on Telegram
2. Get your bot token (looks like: `1234567890:ABCDef...`)
3. Find your chat ID (send a message to @userinfobot)
4. Go to **Settings > Integrations** in TradeBook
5. Enter your bot token and chat ID
6. Click **"Verify"** — TradeBook sends a test message "✅ TradeBook connected!"
7. All notifications are now active

### Multi-Destination Routing (for RAs)

For RAs sending to multiple client groups:

1. Go to **Settings > Integrations > Telegram Settings**
2. Click **"Add Chat"**
3. Enter the group's chat ID and the segments it should receive
4. Repeat for each group

Example configuration:
```
Chat 1: "Personal"      → All segments + Morning Briefing + EOD
Chat 2: "Intraday Group"→ Equity_Intraday alerts only + EOD (Intraday)
Chat 3: "Options Group" → Options alerts only + EOD (Options)
Chat 4: "MCX Group"     → Commodities alerts only
```

**Custom bot per group:** For a more professional appearance, each chat can use a different bot token — so your Intraday subscribers receive messages from "📊 XYZ Intraday Bot" and Options subscribers from "⚡ XYZ Options Bot".

---

## 14. Settings & Customization

The **Settings page** has five sections:

### Profile
- Display name and email
- Profile avatar
- **Starting Capital** — your initial account size used for P&L percentage calculations and equity curve baseline

### Preferences
| Setting | Default | Effect |
|---|---|---|
| Default SL % | 2% | Pre-fills stop loss in every new trade form |
| Alert Check Frequency | 5 min | How often `evaluate-alerts` runs for your account |
| Auto-Sync Portfolio | On | Auto-syncs Dhan portfolio on login |
| Theme | Dark | Dark or Light mode for the entire app |
| Timezone | Asia/Kolkata | Ensures all times display correctly in IST |

### Security
- Change password
- View active sessions (devices logged in)
- Revoke sessions for security

### Integrations
- **Dhan**: Connect/disconnect, enter client ID and token, sync status
- **Telegram**: Add/remove chat destinations, test connection, configure per-segment routing
- **Instrument Master**: View last sync status for the 50K+ scrip database, trigger manual resync

### Tags
Create and manage your custom tagging taxonomy:
- **Setup Tags** — Your trading setups (e.g., "Bull Flag", "VWAP Bounce", "Gap Fill", "EMA Crossover")
- **Mistake Tags** — Your process failures (e.g., "FOMO", "No SL", "Oversize", "Chased", "Moved SL")

These tags appear across the entire app — in trade creation, trade review, journal patterns analysis, and the mistakes tracker.

---

## 15. The Full Daily Workflow

Here is a practical example of how a trader or RA uses TradeBook on a typical trading day:

### 8:45 AM — Pre-Market
- Receive **Morning Briefing on Telegram**
- See: 3 open positions, 7 active alerts, 1 alert expiring today, 2 studies for today
- Open TradeBook Dashboard on laptop/tablet
- Review open positions and their SL/Target levels
- Add 2 new PENDING trades (ideas you plan to take if conditions are met)
- Set 3 new price alerts for today's key levels

### 9:15 AM — Market Opens
- Watch live LTP on Trades page — prices updating every 30 seconds
- First 15 minutes: TATAMOTORS hits your breakout alert → Telegram notification received
- Review the alert, decide to enter → change the PENDING trade to OPEN, note the entry price
- 10:00 AM: RELIANCE hits Target 1 → Telegram notification → close partial position

### 11:30 AM — Mid-Session Review
- Check Dashboard — KPI cards show Today's P&L: +₹4,200
- Open Trades page — 2 OPEN, 1 trade hit T1 (partially closed)
- Review Journal > Calendar — see yesterday was a red day, not going to overtrade today

### 2:30 PM — Pre-Close
- 3 alerts triggered so far, 2 are still active
- One position's TSL has been moving up as RELIANCE rallied
- Decide to hold RELIANCE into close (positional)
- Bulk-close all intraday positions — click Bulk, select all, "Close at Market"

### 3:30 PM — Market Closes
- Receive **EOD Report on Telegram**
- Shows: +₹3,700 day, 4 trades, 75% win rate for the day
- Log into TradeBook to review closed trades
- Open each closed trade → add post-trade notes ("Should have held longer"), set rating (3/5), tag mistakes ("Early exit on NIFTY")
- Open Journal > Patterns & Mistakes — check if any patterns emerging

### Sunday — Weekly Review
- Receive **Weekly Report on Telegram** (auto-generated)
- Log into Reports page — see the full week breakdown
- Click "Send to Telegram" → report sent to client groups
- Open Analytics page — check time-of-day chart, any change in patterns?
- Open Mistakes page — "Moved SL" appeared twice this week, need to fix that

---

*This is MyTradeBook — one platform for everything a serious Indian trader or research analyst needs to track, analyse, improve, and automate their trading.*

---

**Last Updated:** February 2026
**Version:** 1.0.0
**Disclaimer:** TradeBook is not SEBI registered. All content is for educational and personal record-keeping purposes only. Not investment advice.
