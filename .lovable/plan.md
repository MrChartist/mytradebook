

## Plan: Interactive Multi-Tab Dashboard Preview

Transform the static dashboard mockup into a tabbed, auto-cycling preview that showcases multiple pages (Dashboard, Trades, Studies, Fundamentals, Analytics) — making it feel like a real working app.

### What We'll Build

**1. Tab Navigation Bar** inside the browser chrome
- Horizontal tabs: Dashboard, Trades, Studies, Fundamentals, Analytics
- Auto-cycles every 5 seconds with a progress indicator underline
- Click to switch manually; pause auto-cycle on hover

**2. Five Mockup Views** (each a lightweight, static-data component rendered inside the preview)

| Tab | Content |
|-----|---------|
| **Dashboard** | Keep existing — Today's P&L hero card, KPI strip, chart + alerts (current implementation) |
| **Trades** | Mini trade table with 5-6 rows (Symbol, Type, Entry, Exit, P&L, Status badge), filter pills (All/Open/Closed), column headers |
| **Studies** | 3-4 study cards in a grid (title, ticker, date, thumbnail chart placeholder, notes snippet) |
| **Fundamentals** | Mini screener table — 5 stocks with columns (Name, Price, PE, Market Cap, 52W range bar) |
| **Analytics** | Simplified heatmap grid (day-of-week × time-of-day) + a win rate donut/ring + a small equity curve line |

**3. Smooth Transitions**
- `framer-motion` `AnimatePresence` with fade+slide for tab content switching
- Active tab gets an animated underline using `layoutId`

**4. Responsive Behavior**
- On mobile: hide sidebar, show only 3 tabs (Dashboard, Trades, Analytics) with horizontal scroll
- Maintain the existing window chrome (traffic lights) and ticker bar

### Technical Approach

- Refactor `DashboardPreview.tsx` — extract current dashboard content into a `DashboardTab` sub-component
- Add `TradesTab`, `StudiesTab`, `FundamentalsTab`, `AnalyticsTab` as inline components within the same file (keeps it self-contained)
- Add state: `activeTab` + `useEffect` timer for auto-cycling
- All data is hardcoded mock data — no API calls
- Existing count-up animations remain for the Dashboard tab

### Files Changed
- `src/components/landing/DashboardPreview.tsx` — full rewrite with tabbed system

