

# Add Documentation Page for TradeBook

## Overview
Create a comprehensive `/docs` documentation page that explains every feature and capability of the TradeBook platform. The page will use a clean layout with sidebar navigation and detailed content sections.

## New File: `src/pages/Docs.tsx`

A full documentation page with the following structure:

### Layout
- Sticky sidebar navigation on desktop (collapses to horizontal scroll tabs on mobile)
- Clean white/card background with section anchors
- Consistent with the app's design system (cards, badges, typography)
- Public route -- no authentication required

### Documentation Sections

1. **Getting Started**
   - What is TradeBook (Indian market trading journal for NSE, BSE, MCX)
   - Signing up and initial setup (starting capital, preferences)
   - Quick tour overview of the sidebar navigation

2. **Dashboard**
   - Personalized greeting with market status (NSE/BSE hours)
   - Today's P&L hero card with real-time updates
   - KPI Cards: MTD P&L, Open Positions, Win Rate, Active Alerts
   - Risk Gauge and Goal Tracker (daily 1% / monthly 5% targets)
   - Equity Curve widget
   - Streak & Discipline tracker (oversize trade warnings at >10% threshold)
   - Calendar Heatmap (compact journal view)
   - Widget customization: toggle visibility, reorder widgets
   - Segment filter (All, Intraday, Positional, Futures, Options, Commodities)
   - Month selector for historical comparison

3. **Trade Management**
   - Creating trades: symbol search, segment selection, entry price, stop loss, targets (up to 5)
   - Trade statuses: Planned, Open, Closed, Cancelled
   - Rating (1-10) and Confidence Score (1-5) per trade
   - Trailing Stop Loss (percentage, points, or trigger price)
   - Multi-Leg Strategy trades (grouping legs under a parent)
   - Position Sizing Calculator
   - Post-Trade Review (execution quality + lessons on close)
   - Chart image uploads (up to 5 per trade)
   - Bulk operations: select multiple trades, bulk cancel/close at market
   - CSV Import and Export
   - Trade Templates for quick entry
   - Live price tracking for open positions (via Dhan integration)
   - List and Grid view modes, sorting and filtering

4. **Alerts System**
   - Condition types: Price Above/Below, Crosses Above/Below, % Change, Volume Spike, Custom
   - Recurrence: Once, Daily, Continuous
   - Trigger cooldowns (5m to 1D)
   - Market hours only toggle
   - Snooze (1h or rest of day)
   - Expiry dates
   - Live LTP tracking with distance-to-target calculations
   - Telegram delivery channel
   - Bulk pause all alerts
   - Grid/List views with sort and search

5. **Studies & Research**
   - Categories: Technical, Fundamental, News, Sentiment, Other
   - Status workflow: Draft, Active, Triggered, Invalidated, Archived
   - Pattern tagging: Classic Patterns (Double Top, H&S, Cup & Handle, etc.), Candlestick (Engulfing, Pin Bar, Doji, etc.), Setup (Breakout, Retest, Gap, etc.)
   - Custom tags support
   - Tag-based filtering with counts
   - Live prices for active/draft studies
   - Duration tracking (< 6M, 6M-2Y, 2-5Y, > 5Y)

6. **Watchlists**
   - Multiple named watchlists with color coding
   - Add instruments via unified search
   - Live prices with LTP, change %, volume, day high/low
   - Sort by % change, volume, LTP, or alphabetically
   - Quick actions: create alert or trade directly from watchlist item
   - Market closed detection

7. **Trade Journal**
   - Dashboard tab: Summary cards (Total P&L, Win Rate, Avg Holding Time, Best Pattern, Top Mistake)
   - Equity curve visualization
   - Performance tables by Rating and Confidence
   - Patterns & Mistakes analysis
   - Calendar tab: visual P&L heatmap per day
   - Mistakes Review tab: Kanban board grouped by severity
   - Segment and date range filters (30d, 60d, 90d, custom)

8. **Analytics (Pro)**
   - Win Rate, Total P&L, Avg Win, Avg Loss, Expectancy, Profit Factor, Best/Worst Trade
   - AI Trade Insights (powered by AI)
   - Equity Curve with Drawdown analysis
   - Segment Performance breakdown (win rates, Sharpe ratios)
   - Time of Day heatmap
   - Day of Week heatmap
   - Streak Tracker
   - Setup/Tag Performance Matrix
   - Risk-Reward Analytics
   - Risk of Ruin Calculator

9. **Calendar & Daily Journal**
   - Monthly calendar with color-coded P&L per day (green/red)
   - Click any date to open daily journal editor
   - Write free-form notes for each trading day
   - View trades closed on that date

10. **Mistakes Review**
    - Repeat pattern analysis with occurrence counts and total loss
    - 6-month mistake trend chart
    - Loss severity breakdown: Low (< Rs 500), Medium (Rs 500-2K), High (> Rs 2K)
    - Mistake tags management (via Settings)

11. **Weekly Reports (Pro)**
    - Auto-generated every Monday at 6 AM IST
    - Manual generation option
    - Segment-by-segment breakdown (P&L, win rate, trades, top setups, common mistakes)
    - Download as PDF
    - Send to Telegram

12. **Integrations**
    - Dhan Broker: portfolio sync, live prices, trade execution
    - Telegram: notifications for alerts, EOD reports, morning briefings, weekly reports

13. **Keyboard Shortcuts**
    - `N` -- New Trade, `A` -- New Alert, `S` -- New Study, `/` -- Search
    - `1-6` -- Navigate to Dashboard, Trades, Alerts, Studies, Watchlist, Analytics
    - Command Palette for quick actions

14. **Settings**
    - Profile management
    - Billing and subscription (Free, Pro, Elite tiers)
    - Preferences (theme, starting capital)
    - Security (password change)
    - Integrations (Dhan, Telegram)
    - Tag Management (setup tags, mistake tags with severity)
    - Capital management

## Route Changes: `src/App.tsx`
- Add `/docs` as a public route (no auth required)
- Import Docs page

## Landing Page Changes: `src/pages/Landing.tsx`
- Add "Docs" link in the navbar (between existing nav links)
- Add "Docs" link in the footer

## Technical Details
- The Docs page will be a single-file component (~600-800 lines)
- Uses existing UI components: Card, Badge, Tabs, ScrollArea
- Sidebar navigation uses anchor links to scroll to sections
- Mobile: sidebar becomes horizontal scrollable tabs at the top
- Each section uses a consistent card-based layout with icons, feature lists, and descriptive text
- No external dependencies needed

