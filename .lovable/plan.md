

# Docs Page Enhancement -- Visual Mockups and Advanced Detail

## Problem
The current Docs page is entirely text-based -- bullet lists and cards with no visual elements. It lacks the "show, don't tell" approach that makes documentation engaging and easy to understand.

## Solution
Add inline visual mockups, diagrams, and interactive previews throughout every section to visually demonstrate each feature. These are built with pure CSS/JSX (no images needed).

## Visual Components to Add

### New Reusable Mini-Mockup Components (inside Docs.tsx)

1. **DashboardMockup** -- A mini dashboard wireframe showing KPI cards, equity curve, and calendar heatmap with sample data
2. **TradeCardMockup** -- A realistic trade entry card showing symbol, entry/exit, P&L, tags, and status badge
3. **AlertCardMockup** -- An alert notification card with condition, LTP, distance bar, and status indicator
4. **CalendarHeatmapMockup** -- A 5x7 grid of colored cells showing a month's P&L heatmap
5. **EquityCurveMockup** -- A mini SVG line chart showing a sample equity curve with drawdown shading
6. **KanbanBoardMockup** -- Three columns (Low/Medium/High) with mistake cards
7. **AnalyticsHeatmapMockup** -- A colored grid showing time-of-day performance
8. **ShortcutVisualMockup** -- A keyboard layout highlighting the shortcut keys
9. **WatchlistMockup** -- A mini table showing symbols with LTP, change%, and action buttons
10. **TelegramNotifMockup** -- A chat-bubble style notification showing alert trigger message
11. **BentoFeatureGrid** -- A visual overview at the top showing all major features as an interactive bento grid
12. **PricingComparisonMockup** -- Visual comparison of Free vs Pro vs Team plans

## Section-by-Section Enhancements

### Hero Section
- Add a horizontal "feature at a glance" bento strip below the subtitle showing 6 mini icons with labels (Dashboard, Trades, Alerts, Analytics, Journal, Integrations)
- Add a "Jump to section" visual grid with icon cards

### Getting Started
- Add a **3-step onboarding flow visual** (Sign Up -> Set Capital -> Start Trading) with connecting arrows and numbered circles
- Add a mini sidebar navigation mockup showing all the menu items

### Dashboard
- Add **DashboardMockup** -- a full mini-dashboard wireframe with:
  - Today's P&L hero card (green, showing +Rs 12,450)
  - 4 KPI metric cards in a row
  - Mini equity curve SVG
  - Mini calendar heatmap grid
  - Risk gauge arc
- Place this as a full-width visual above the feature cards

### Trade Management  
- Add **TradeCardMockup** showing a sample RELIANCE trade with all fields filled
- Add a **trade lifecycle flow diagram** (Planned -> Open -> Closed) with colored status badges
- Add a mini **position sizing calculator** visual

### Alerts
- Add **AlertCardMockup** showing "NIFTY > 22,500" with a progress bar showing distance to trigger
- Add a **TelegramNotifMockup** showing the alert notification message format

### Watchlists
- Add **WatchlistMockup** -- a mini table with 4-5 instruments, live price columns, and action buttons

### Journal
- Add **CalendarHeatmapMockup** -- a visual 5-week calendar with colored cells
- Add **KanbanBoardMockup** -- three columns with mistake cards

### Analytics
- Add **EquityCurveMockup** -- SVG chart with drawdown shading
- Add **AnalyticsHeatmapMockup** -- time-of-day colored grid
- Add sample metric cards (Win Rate 62%, Profit Factor 1.8, Sharpe 1.4)

### Integrations
- Add **Dhan flow diagram** (Connect -> Sync -> Live Prices -> Execute)
- Add **TelegramNotifMockup** showing different notification types

### Keyboard Shortcuts
- Add a visual keyboard layout with highlighted keys
- Make it interactive -- hover over a key to see its action

### Settings
- Add a mini settings panel mockup showing the tab layout

## Technical Details

### File: `src/pages/Docs.tsx` (major enhancement)
- Add ~15 inline visual mockup components at the top of the file
- Each mockup is a pure CSS/JSX component using existing design tokens
- Uses Tailwind for all styling, SVG for charts
- Sample data is hardcoded (static mockups, not connected to real data)
- Responsive -- mockups stack vertically on mobile
- All mockups use the app's color system (profit green, loss red, accent orange)

### Visual Design Approach
- Each mockup sits inside a subtle bordered container with rounded corners and soft shadow
- Background uses `bg-muted/20` with a subtle dot grid pattern
- Mockups have a slight scale-up on hover for interactivity
- Color coding matches the actual app (green for profit, red for loss, orange for accent)

### No New Dependencies
- All visuals built with Tailwind CSS + inline SVGs
- No external image assets needed
- No new npm packages

