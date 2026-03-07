

# Trade Card Sharing — Individual Trade Cards

## What
Let users share a single trade as a beautiful branded card image — showing entry/exit, P&L, R:R, tags, segment, and outcome. This complements the existing P&L summary cards (which show aggregated performance) by enabling sharing of specific winning/losing trades.

## Card Content
Each trade card will display:
- **Symbol & Segment** (e.g., RELIANCE · Equity Intraday)
- **Direction badge** (LONG/SHORT)
- **Entry → Exit price** with date range
- **P&L** (absolute + percentage) in profit/loss colors
- **Risk-Reward ratio** (if SL/targets set)
- **Quantity, Timeframe, Setup tags**
- **Trade outcome** (WIN/LOSS badge)
- **"Made with TradeBook" watermark**

## Architecture

Reuses the existing sharing infrastructure — same 3 templates (Dark Premium, Light Clean, Gradient), same `html-to-image` export pipeline, same modal UX pattern.

```text
┌─────────────────────────────────────┐
│  TradeShareModal                    │
│  ┌───────────────────────────────┐  │
│  │  TradeShareCard (1080×1080)   │  │
│  │  - Symbol, direction, segment │  │
│  │  - Entry → Exit              │  │
│  │  - P&L hero number           │  │
│  │  - Stats grid (R:R, qty...)  │  │
│  │  - Tags row                  │  │
│  │  - Watermark                 │  │
│  └───────────────────────────────┘  │
│  [ Template selector ]              │
│  [ Download PNG ] [ Copy ]          │
└─────────────────────────────────────┘
```

## New / Modified Files

| File | Action |
|------|--------|
| `src/components/sharing/TradeShareModal.tsx` | **Create** — Modal with template selector, preview, download/copy actions. Accepts a `Trade` prop. |
| `src/components/sharing/TradeShareCardTemplates.tsx` | **Create** — 3 card templates (Dark, Light, Gradient) rendering individual trade data with inline styles. |
| `src/components/modals/TradeDetailActions.tsx` | **Edit** — Add a "Share" icon button alongside existing actions. |
| `src/components/sharing/ShareCardTemplates.tsx` | Minor refactor — extract shared helpers (`fmt`, `watermark`, `statBox`) into a shared utils to reuse across both P&L and Trade cards. |

## Integration Point
The share button goes inside `TradeDetailActions.tsx` (visible in the trade detail modal). When clicked, it opens `TradeShareModal` with the current trade data. Only shown for CLOSED trades (since open trades don't have final P&L).

## Data Mapping (Trade → Card)
All data comes directly from the `Trade` type — no new hook needed:
- `trade.symbol`, `trade.segment`, `trade.trade_type`
- `trade.entry_price`, `trade.exit_price`, `trade.quantity`
- `trade.pnl`, `trade.pnl_percent`
- `trade.stop_loss`, `trade.targets` (for R:R calculation)
- `trade.created_at`, `trade.closed_at` (date range)
- Tags from `useTradeTags(trade.id)`

