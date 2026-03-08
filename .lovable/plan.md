

# Phase 2 — Documentation Completeness

## Audit Summary
After reviewing the full 1,947-line Docs.tsx, here's what's missing vs already covered:

### Already Documented (no changes needed)
Position Sizing Calculator, Multi-Leg Strategies, Post-Trade Review, AI Pattern Detection, Sector Rotation Heatmap, Setup Win-Rate Matrix, Emotional P&L Correlation, Share Cards, Achievements & Badges, Floating Trade Ticker, Animated KPIs, Portfolio Heat Map, Daily Review Wizard.

### Missing Feature Documentation (10 items)

| # | Feature | Component | Where to add |
|---|---------|-----------|-------------|
| 1 | **Trading Rules Checklist** | `TradingRulesChecklist.tsx` | Trade Management section |
| 2 | **AI Trade Coach** | `TradeCoachPanel.tsx` | Trade Management section |
| 3 | **Smart Alert Suggestions** | `SmartAlertSuggestions.tsx` | Alerts section |
| 4 | **Command Palette** | `CommandPalette.tsx` | Keyboard Shortcuts section (expand) |
| 5 | **Quick Close Popover** | `QuickClosePopover.tsx` | Trade Management section |
| 6 | **Option Chain Selector** | `OptionChainSelector.tsx` | Trade Management (under Multi-Leg) |
| 7 | **Drawdown Recovery Analysis** | `EquityCurveDrawdown.tsx` | Analytics section (expand existing card) |
| 8 | **Risk-Reward Analytics** | `RiskRewardAnalytics.tsx` | Analytics section (expand existing card) |
| 9 | **Streak Tracker** | `StreakTracker.tsx` | Analytics section (expand) |
| 10 | **Day/Time of Day Analysis** | `DayOfWeekAnalysis.tsx`, `TimeOfDayAnalysis.tsx` | Analytics section (expand) |

### Docs UX Improvements (7 items)

| # | Improvement | Details |
|---|------------|---------|
| 1 | **Reading time estimate** | Calculate from section count, show in hero |
| 2 | **Section anchored deep-links** | Add copy-link icon button on each SectionHeader |
| 3 | **"Last updated" timestamp** | Add to hero area |
| 4 | **Related sections cross-links** | Add "See also" links at bottom of key sections |
| 5 | **Print-friendly styles** | `@media print` rules hiding sidebar, navbar |
| 6 | **Section word count badge** | Show estimated read time per section |
| 7 | **FAQ expansion** | Add 4 more FAQs covering new features |

## Implementation Plan

### File: `src/pages/Docs.tsx`

**Trade Management section (after the Achievements card ~line 782):**
- Add `FeatureCard` for **Trading Rules Checklist**: Pre-trade discipline enforcement, custom rules, checked state, edit/delete, "All clear" indicator
- Add `FeatureCard` for **AI Trade Coach** (badge="AI"): Auto-triggers on freshly closed trades, markdown feedback, refresh, cached in DB
- Add `FeatureCard` for **Quick Close Popover**: One-click close from trades list, enter exit price inline, triggers post-trade review

**Alerts section (after Alert Management card ~line 940):**
- Add `FeatureCard` for **Smart Alert Suggestions** (badge="AI"): AI analyzes frequent symbols, suggests price alerts with reasoning, one-click create

**Trade Management Multi-Leg card (expand ~line 724):**
- Add bullet for **Option Chain Selector**: Strike selection with dynamic increments (50/25/10 based on underlying price), 185+ F&O underlyings

**Analytics section (expand existing cards ~line 1139):**
- Expand "Advanced Analytics" card to add detail for **Drawdown Recovery**, **Risk-Reward Analytics**, **Streak Tracker**, **Day/Time of Day Analysis**
- OR split into individual FeatureCards for each

**Keyboard Shortcuts section (~line 1560):**
- Add dedicated FeatureCard for **Command Palette**: Cmd+K search, quick trade entry, navigate anywhere, recent items

**Hero area (~line 362):**
- Add reading time estimate: "~25 min read"
- Add "Last updated: March 2026"

**SectionHeader component (~line 152):**
- Add a small copy-link button that copies `#section-id` URL to clipboard with toast feedback

**FAQ section (~line 1750):**
- Add 4 new FAQs:
  - "What is the AI Trade Coach?" 
  - "How do Trading Rules work?"
  - "Can I get AI-suggested alerts?"
  - "How does the Command Palette work?"

**Changelog (~line 1790):**
- Add v3.1 entry for Trading Rules Checklist, AI Trade Coach, Smart Alert Suggestions, Command Palette

**Print styles in `src/index.css`:**
- Add `@media print` block hiding sidebar, navbar, back-to-top button

### Summary
- **1 file edited**: `src/pages/Docs.tsx` (add ~200 lines of new FeatureCard content + UX tweaks)
- **1 file edited**: `src/index.css` (print styles)
- No new components or database changes needed

