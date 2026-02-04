
# Complete Trade Journal Enhancement Plan

## Executive Summary

This plan implements 6 critical features to make the research trade journal fully functional:

1. **Cron Jobs** - Automated scheduling for trade-monitor and evaluate-alerts
2. **Real Dhan API Price Fetching** - Replace mock prices with live market data
3. **TSL Activation Fix** - Ensure TSL activates immediately as configured
4. **Edit Alert Modal** - Complete alerts management UI
5. **Weekly Report Generation** - Auto-generate and send via Telegram
6. **Real-time Price Polling** - Show live prices in the UI

---

## Feature 1: Set Up Cron Jobs (Critical)

**Why needed:** Edge functions `trade-monitor` and `evaluate-alerts` exist but never run automatically.

### Implementation

1. **Enable pg_cron and pg_net extensions** via SQL migration

2. **Create cron job for trade-monitor (every 30 seconds)**
   - For 30-second frequency, we'll use a workaround since pg_cron minimum is 1 minute
   - Run every minute with offset logic, or run every minute (acceptable for research trades)

3. **Create cron job for evaluate-alerts (every 5 minutes)**

4. **Create cron job for weekly-report (Monday 6 AM IST)**

### SQL to execute (via migration):
```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Trade monitor - every minute
SELECT cron.schedule(
  'trade-monitor-job',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nuilpmoipiazjafpjaft.supabase.co/functions/v1/trade-monitor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Alert evaluator - every 5 minutes
SELECT cron.schedule(
  'evaluate-alerts-job', 
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://nuilpmoipiazjafpjaft.supabase.co/functions/v1/evaluate-alerts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Weekly report - Monday 6 AM IST (00:30 UTC)
SELECT cron.schedule(
  'weekly-report-job',
  '30 0 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://nuilpmoipiazjafpjaft.supabase.co/functions/v1/generate-weekly-report',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

---

## Feature 2: Real Dhan API Price Fetching

**Why needed:** Current code uses mock prices that don't reflect actual market movements.

### Implementation

**Update `trade-monitor/index.ts`:**

Replace `getCurrentPrice()` function with real Dhan LTP API call:

```typescript
async function getCurrentPrice(
  symbol: string, 
  dhanToken: string | undefined
): Promise<number | null> {
  if (!dhanToken) {
    // Fallback to mock for testing
    return getMockPrice(symbol);
  }

  try {
    // Dhan Market Quote API for LTP
    const response = await fetch(`${DHAN_API_URL}/marketfeed/ltp`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "access-token": dhanToken,
      },
      body: JSON.stringify({
        NSE_EQ: [symbol],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      // Dhan returns: { data: { NSE_EQ: { "SYMBOL": { last_price: 123.45 } } } }
      const quote = data?.data?.NSE_EQ?.[symbol];
      if (quote?.last_price) {
        return quote.last_price;
      }
    }
    
    // Fallback to mock if API fails
    console.warn(`Could not fetch LTP for ${symbol}, using mock`);
    return getMockPrice(symbol);
  } catch (e) {
    console.error(`Error fetching price for ${symbol}:`, e);
    return getMockPrice(symbol);
  }
}
```

**Also update `evaluate-alerts/index.ts`** with similar real price fetching logic.

---

## Feature 3: Verify TSL Activation Flow

**Current status:** TSL logic already set to activate immediately if no trigger price is set.

### Verification Steps

1. Add logging to confirm TSL activates on first run
2. Ensure `trailing_sl_active` gets set to `true` in database
3. Ensure `trailing_sl_current` is calculated correctly

### Enhancement

Add a debug response in trade-monitor to show TSL status:

```typescript
// In results object
tslActivations: [] as string[],

// When TSL activates
if (tslResult.tslUpdated && !trade.trailing_sl_active) {
  results.tslActivations.push(trade.symbol);
}
```

---

## Feature 4: Edit Alert Modal

**Why needed:** Edit button in Alerts page does nothing currently.

### Implementation

**Create `src/components/modals/EditAlertModal.tsx`:**

```typescript
interface EditAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
}

export function EditAlertModal({ open, onOpenChange, alert }: EditAlertModalProps) {
  const { updateAlert } = useAlerts();
  
  const form = useForm<CreateAlertInput>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      symbol: alert?.symbol || "",
      condition_type: alert?.condition_type || "PRICE_GT",
      threshold: alert?.threshold || 0,
      recurrence: alert?.recurrence || "ONCE",
    },
  });

  useEffect(() => {
    if (alert) {
      form.reset({
        symbol: alert.symbol,
        condition_type: alert.condition_type,
        threshold: alert.threshold,
        recurrence: alert.recurrence,
      });
    }
  }, [alert]);

  const onSubmit = async (data: CreateAlertInput) => {
    if (!alert) return;
    await updateAlert.mutateAsync({
      id: alert.id,
      symbol: data.symbol,
      condition_type: data.condition_type,
      threshold: data.threshold,
      recurrence: data.recurrence,
    });
    onOpenChange(false);
  };

  // ... form UI similar to CreateAlertModal
}
```

**Update `src/pages/Alerts.tsx`:**

- Add state for `editModalOpen` and `selectedAlert`
- Wire up Edit button to open modal with selected alert
- Pass alert data to EditAlertModal

---

## Feature 5: Weekly Report Generation

**Why needed:** Reports page shows mock data; no actual report generation exists.

### Implementation

**Create new edge function `supabase/functions/generate-weekly-report/index.ts`:**

```typescript
// Aggregate trades from past week by segment
// Calculate: total P&L, win rate, best/worst trades, top setups, common mistakes
// Insert into weekly_reports table
// Send Telegram notification

async function generateWeeklyReport(supabase, segment, weekStart, weekEnd) {
  // Query trades for this segment in date range
  const { data: trades } = await supabase
    .from("trades")
    .select(`
      *,
      trade_patterns(pattern_id, pattern_tags(*)),
      trade_mistakes(mistake_id, mistake_tags(*))
    `)
    .eq("segment", segment)
    .eq("status", "CLOSED")
    .gte("closed_at", weekStart)
    .lte("closed_at", weekEnd);

  // Calculate metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  
  // Find top setups and common mistakes
  // ...

  // Insert report
  const { data: report } = await supabase
    .from("weekly_reports")
    .insert({
      user_id: userId,
      segment,
      week_start: weekStart,
      week_end: weekEnd,
      total_trades: totalTrades,
      winning_trades: winningTrades.length,
      losing_trades: losingTrades.length,
      total_pnl: totalPnl,
      win_rate: winRate,
      // ... other fields
    })
    .select()
    .single();

  // Send Telegram notification
  await sendTelegramNotification(report);
}
```

**Update `src/pages/Reports.tsx`:**

- Fetch real reports from database
- Add "Generate Report" functionality
- Connect "Send to Telegram" button

---

## Feature 6: Real-time Price Polling in UI

**Why needed:** Users must manually refresh to see updated prices.

### Implementation

**Create `src/hooks/useLivePrices.ts`:**

```typescript
export function useLivePrices(symbols: string[], intervalMs = 30000) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (symbols.length === 0 || !isPolling) return;

    const fetchPrices = async () => {
      try {
        const { data } = await supabase.functions.invoke("get-live-prices", {
          body: { symbols },
        });
        if (data?.prices) {
          setPrices(data.prices);
        }
      } catch (e) {
        console.error("Price polling error:", e);
      }
    };

    // Initial fetch
    fetchPrices();

    // Poll every interval
    const interval = setInterval(fetchPrices, intervalMs);
    return () => clearInterval(interval);
  }, [symbols.join(","), intervalMs, isPolling]);

  return { prices, isPolling, setIsPolling };
}
```

**Create `supabase/functions/get-live-prices/index.ts`:**

```typescript
// Accept array of symbols
// Fetch LTP from Dhan for each
// Return price map: { RELIANCE: 2450, TCS: 3850, ... }
```

**Update Dashboard and Trades pages:**

- Use `useLivePrices` hook with open trade symbols
- Display live price with visual indicator
- Show last update timestamp
- Add "Live" badge when polling is active

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| Database (SQL) | Execute | Enable pg_cron, pg_net, schedule cron jobs |
| `supabase/functions/trade-monitor/index.ts` | Modify | Add real Dhan LTP API call |
| `supabase/functions/evaluate-alerts/index.ts` | Modify | Add real Dhan price fetching |
| `supabase/functions/generate-weekly-report/index.ts` | Create | Weekly report generation logic |
| `supabase/functions/get-live-prices/index.ts` | Create | Fetch live prices endpoint |
| `supabase/config.toml` | Modify | Add new function configs |
| `src/components/modals/EditAlertModal.tsx` | Create | Edit alert modal UI |
| `src/pages/Alerts.tsx` | Modify | Wire up edit modal |
| `src/hooks/useLivePrices.ts` | Create | Client-side price polling |
| `src/pages/Dashboard.tsx` | Modify | Show live prices for open positions |
| `src/pages/Trades.tsx` | Modify | Show live prices in trade list |
| `src/pages/Reports.tsx` | Modify | Connect to real data, add generation |

---

## Execution Order

1. **Phase 1: Database** - Enable extensions and schedule cron jobs
2. **Phase 2: Edge Functions** - Update price fetching, create new functions
3. **Phase 3: UI Components** - Create EditAlertModal, wire up alerts
4. **Phase 4: Live Prices** - Implement polling hook and update pages
5. **Phase 5: Reports** - Connect real data and generation

---

## Expected Outcome

After implementation:
- Trade monitor runs every minute, checking SL/TSL/targets automatically
- Alerts evaluate every 5 minutes with real prices
- Weekly reports generate automatically on Mondays
- Users can edit existing alerts
- Dashboard shows live prices for open trades
- Telegram notifications fire for all trade events
