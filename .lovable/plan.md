
# Comprehensive Telegram Notifications Plan

## Current State Analysis

After reviewing the codebase, I found that while the notification infrastructure exists, several critical events are **not triggering Telegram notifications**:

### What's Already Working (Backend Automation)
| Event | Edge Function | Telegram Notification |
|-------|--------------|----------------------|
| SL Hit | trade-monitor | Yes - Direct send |
| TSL Hit | trade-monitor | Yes - Direct send |
| TSL Activated | trade-monitor | Yes - Direct send |
| TSL Moved | trade-monitor | Yes - Direct send |
| Target 1/2/3 Hit | trade-monitor | Yes - Direct send |
| Alert Triggered | evaluate-alerts | Yes - Direct send |

### What's Missing Notifications

| Event | Location | Status |
|-------|----------|--------|
| New Trade Created | useTrades.ts | Calls `notifyNewTrade()` but fires and forgets |
| Trade Closed Manually | useTrades.ts | Calls `notifyTradeClosed()` but fires and forgets |
| Trade Updated (manual SL change) | useTrades.ts | **NO notification** |
| Alert Created | useAlerts.ts | **NO notification** |
| Alert Deleted | useAlerts.ts | **NO notification** |
| Alert Paused/Resumed | useAlerts.ts | **NO notification** |
| Trade Event Added | useTradeEvents.ts | **NO notification** |

---

## Implementation Plan

### 1. Add New Notification Types to telegram-notify Edge Function

Update the edge function to support these new notification types:
- `trade_sl_modified` - When SL is manually changed
- `alert_created` - When a new alert is created
- `alert_paused` - When an alert is paused/resumed
- `alert_deleted` - When an alert is deleted
- `trade_event_added` - When a manual event is added to a trade

### 2. Update src/lib/telegram.ts Helper Functions

Add new convenience functions:
```text
notifySLModified(tradeId, oldSL, newSL)
notifyAlertCreated(alertId)
notifyAlertPaused(alertId, isPaused)
notifyAlertDeleted(symbol, condition)
notifyTradeEventAdded(tradeId, eventType)
```

### 3. Hook into Frontend Actions

Update these hooks to trigger notifications:

**useTrades.ts:**
- `updateTrade` mutation - Send notification when SL is modified

**useAlerts.ts:**
- `createAlert` mutation - Send notification when alert is created
- `toggleAlert` mutation - Send notification when alert is paused/resumed
- `deleteAlert` mutation - Send notification when alert is deleted

**useTradeEvents.ts:**
- `addEvent` mutation - Send notification for significant events

### 4. Improve Error Handling

Currently notifications use "fire and forget" - they should:
- Log failures properly
- Show user-friendly toast if notification fails
- Not block the main action if notification fails

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/telegram-notify/index.ts` | Add 5 new notification types |
| `src/lib/telegram.ts` | Add 5 new helper functions |
| `src/hooks/useTrades.ts` | Add notification on SL update |
| `src/hooks/useAlerts.ts` | Add notifications for create/toggle/delete |
| `src/hooks/useTradeEvents.ts` | Add notification for event creation |

### New Notification Message Formats

**SL Modified:**
```text
✏️ *Stop Loss Modified*

Symbol: *RELIANCE*
Old SL: ₹2350 → New SL: ₹2380
Current P&L: +₹500 (+2.1%)
```

**Alert Created:**
```text
🔔 *New Alert Created*

Symbol: *RELIANCE*
Condition: Price Above ₹2500
Recurrence: One-time
```

**Alert Paused:**
```text
⏸️ *Alert Paused*

Symbol: *RELIANCE*
Condition: Price Above ₹2500
```

**Alert Deleted:**
```text
🗑️ *Alert Deleted*

Symbol: *RELIANCE*
Condition: Price Above ₹2500
```

**Trade Event Added:**
```text
📝 *Trade Event Added*

Symbol: *RELIANCE*
Event: Partial Exit
Price: ₹2480
Notes: Booked 50% at target 1
```

---

## Execution Summary

1. **Update telegram-notify edge function** - Add 5 new notification handlers
2. **Update telegram.ts** - Add 5 new helper functions with proper types
3. **Update useTrades.ts** - Add SL modification notification
4. **Update useAlerts.ts** - Add create/toggle/delete notifications
5. **Update useTradeEvents.ts** - Add event notification
6. **Deploy edge function** - Re-deploy telegram-notify
7. **Test all flows** - Verify each notification type works

---

## Expected Outcome

After implementation, users will receive Telegram notifications for:
- Every new trade created
- Every trade closed (manual or automatic)
- Every SL modification
- Every target hit (automatic)
- Every TSL activation/movement (automatic)
- Every alert created
- Every alert triggered (automatic)
- Every alert paused/resumed
- Every alert deleted
- Manual trade events (partial exits, notes, etc.)

This creates a complete audit trail on Telegram for all trading activity.
