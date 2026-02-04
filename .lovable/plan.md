

# Research Trade Journal with Trailing Stop Loss and Telegram Alerts

## Overview

This plan transforms the existing trade tracking system into a **research-focused trade journal** that:
1. Removes the concept of "quantity" (since this is for research/analysis, not actual trading)
2. Adds **Trailing Stop Loss** functionality
3. Sends automatic Telegram notifications for all trade events (entry, SL hit, TSL updates, target hits)
4. Connects the Trade Journal and all alerts with Telegram

---

## Current State Analysis

**Existing Features:**
- Trade creation with symbol, entry price, stop loss, targets (up to 3), rating, confidence
- Trade events tracking (SL_HIT, TARGET1_HIT, etc.)
- Basic trade-monitor edge function that checks SL and targets
- Telegram notifications already working for trade updates

**What Needs to Change:**
- Make quantity optional (default to 1 for research trades)
- Add trailing stop loss configuration and tracking
- Add timeframe/holding period field
- Connect all trade journal events to Telegram
- Auto-trigger alerts based on price movements

---

## Implementation Plan

### Phase 1: Database Schema Updates

Add new columns to the `trades` table:

```text
+-------------------------------+-------------------+----------------------------------+
| Column                        | Type              | Description                      |
+-------------------------------+-------------------+----------------------------------+
| trailing_sl_enabled           | boolean           | Enable trailing stop loss        |
| trailing_sl_percent           | numeric           | Trailing SL distance as %        |
| trailing_sl_points            | numeric           | Trailing SL distance in points   |
| trailing_sl_current           | numeric           | Current trailing SL price        |
| trailing_sl_trigger_price     | numeric           | Price at which TSL activates     |
| timeframe                     | varchar           | e.g., "15min", "1H", "4H", "1D"  |
| holding_period                | varchar           | Expected hold duration           |
+-------------------------------+-------------------+----------------------------------+
```

Add new event type for trailing stop loss:
- `TSL_UPDATED` - When trailing SL is adjusted

### Phase 2: UI Updates

**Create Trade Modal Changes:**
- Make quantity field optional (default 1 for research)
- Add "Timeframe" dropdown (1min, 5min, 15min, 1H, 4H, 1D, 1W)
- Add "Expected Holding Period" field
- Add "Trailing Stop Loss" section:
  - Toggle to enable/disable
  - Choice: Percentage-based or Points-based
  - Trigger price (when TSL activates, e.g., after reaching first target)

**Trade Detail Modal Changes:**
- Display trailing SL status and current value
- Show TSL update history in events timeline
- Visual indicator when TSL is active vs pending

### Phase 3: Trade Monitor Edge Function Enhancements

Update `trade-monitor/index.ts` to:

1. **Check and Update Trailing Stop Loss:**
   - When price moves favorably, update trailing SL
   - For BUY trades: TSL trails below current price
   - For SELL trades: TSL trails above current price
   - Only activate TSL after trigger price is hit

2. **Send Telegram Notifications for:**
   - New trade created (ENTRY)
   - Stop Loss hit
   - Trailing Stop Loss hit
   - Trailing Stop Loss updated (moved in favorable direction)
   - Each target hit (T1, T2, T3)
   - Trade closed manually

3. **Enhanced notification format:**
```text
Example TSL Update Notification:
--------------------------------
🔄 *Trailing SL Updated*

Symbol: *RELIANCE*
Entry: ₹2,400
Current: ₹2,520
New TSL: ₹2,470 (was ₹2,350)

Locked Gain: +₹70 (+2.9%)
```

### Phase 4: Create Telegram Notification Triggers

Modify `useTrades.ts` hook to send Telegram notifications when:
- Trade is created (call telegram-notify with type: "new_trade")
- Trade is closed manually (call telegram-notify with type: "trade_closed")

The trade-monitor edge function already handles:
- SL/TSL hits
- Target hits

### Phase 5: Enhanced Trade Form Schema

Update `src/lib/schemas.ts`:

```typescript
// New fields for research trades
timeframes: ["1min", "5min", "15min", "30min", "1H", "4H", "1D", "1W"] as const

createTradeSchema = z.object({
  symbol: z.string().required(),
  segment: z.enum(marketSegments).required(),
  trade_type: z.enum(tradeTypes).required(),
  quantity: z.number().optional().default(1), // Now optional
  entry_price: z.number().required(),
  stop_loss: z.number().optional(),
  targets: z.array(z.number()).max(3).optional(),
  rating: z.number().min(1).max(10).optional(),
  confidence_score: z.number().min(1).max(5).optional(),
  timeframe: z.enum(timeframes).optional(),
  holding_period: z.string().optional(),
  trailing_sl_enabled: z.boolean().default(false),
  trailing_sl_percent: z.number().positive().optional(),
  trailing_sl_trigger_price: z.number().optional(),
  notes: z.string().optional(),
  // ... other existing fields
})
```

---

## Technical Details

### Trailing Stop Loss Logic

```text
For BUY trades:
1. User sets entry at ₹100, SL at ₹95, TSL 2% trailing, trigger at ₹105
2. When price reaches ₹105, TSL activates
3. TSL = Current Price - (Entry Price * TSL%)
4. If price goes to ₹110, TSL becomes ₹108 (110 - 2%)
5. If price drops to ₹108, TSL is hit -> close trade

For SELL trades:
1. User shorts at ₹100, SL at ₹105, TSL 2% trailing, trigger at ₹95
2. When price reaches ₹95, TSL activates
3. TSL = Current Price + (Entry Price * TSL%)
4. If price drops to ₹90, TSL becomes ₹92 (90 + 2%)
5. If price rises to ₹92, TSL is hit -> close trade
```

### Telegram Message Templates

```text
Entry:
🚀 *New Research Trade*
*BUY* *RELIANCE* at ₹2,400
Timeframe: 4H | Hold: Intraday
🛑 SL: ₹2,350 (-2.1%)
🔄 TSL: 1.5% (activates at ₹2,450)
🎯 T1: ₹2,480 | T2: ₹2,560
⭐ Rating: 8/10 | Confidence: 4/5

SL/TSL Hit:
🛑 *Stop Loss Hit!*
*RELIANCE* closed at ₹2,350
Entry: ₹2,400 → Exit: ₹2,350
P&L: -₹50 (-2.1%)
Reason: SL_HIT

Target Hit:
🎯 *Target 1 Hit!*
*RELIANCE* reached ₹2,480
Entry: ₹2,400 | Current: ₹2,485
P&L: +₹85 (+3.5%)
🔄 TSL now active at ₹2,440

TSL Update:
🔄 *Trailing SL Moved*
*RELIANCE* TSL: ₹2,440 → ₹2,475
Price: ₹2,520
Locked Gain: +₹75 (+3.1%)
```

---

## Files to Modify/Create

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Add trailing SL columns, timeframe, make quantity nullable |
| `src/lib/schemas.ts` | Modify | Add new fields, make quantity optional |
| `src/components/modals/CreateTradeModal.tsx` | Modify | Add TSL, timeframe, holding period fields |
| `src/components/modals/TradeDetailModal.tsx` | Modify | Show TSL status and history |
| `src/hooks/useTrades.ts` | Modify | Send Telegram on create/close, handle new fields |
| `supabase/functions/trade-monitor/index.ts` | Modify | Add TSL logic and enhanced notifications |
| `supabase/functions/telegram-notify/index.ts` | Modify | Add TSL notification templates |

---

## Summary

This plan creates a complete **research trade journaling system** where:
- You log trade ideas with entry, SL, targets, timeframe, and confidence
- Trailing stop loss automatically adjusts as price moves favorably  
- All events (entry, SL/TSL hits, target hits, manual close) send Telegram alerts
- No need to specify quantity since this is research/analysis focused
- Full event history is tracked for later review and pattern analysis

