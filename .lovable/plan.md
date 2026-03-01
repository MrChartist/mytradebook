

# Capital Addition & Withdrawal Tracking

## What This Does
Lets you record when you add money to or withdraw money from your trading account. The Equity Curve will show these capital changes as distinct events (marked with icons/annotations), so your P&L performance isn't distorted by deposits or withdrawals.

## Changes

### 1. New Database Table: `capital_transactions`
Stores every deposit and withdrawal with date, amount, type, and optional notes.

Columns:
- `id` (uuid, primary key)
- `user_id` (uuid, RLS-protected)
- `type` ("DEPOSIT" or "WITHDRAWAL")
- `amount` (numeric, positive value)
- `transaction_date` (timestamptz)
- `notes` (text, optional)
- `created_at` (timestamptz)

RLS: Users can only CRUD their own rows.

### 2. New Hook: `useCapitalTransactions`
- Fetches all capital transactions for the logged-in user
- Provides `addTransaction` and `deleteTransaction` mutations
- Computes `totalDeposited` and `totalWithdrawn` summaries

### 3. Capital Management UI (Settings > Profile section)
Add a "Capital Management" card in the Settings Profile tab showing:
- Current starting capital (editable, already exists)
- Total deposited / Total withdrawn / Net capital
- Transaction history table with date, type, amount, notes, delete button
- "Add Funds" and "Withdraw Funds" buttons that open a small dialog (amount + date + notes)

### 4. Equity Curve Updates
Update `EquityCurveDrawdown` component to:
- Accept capital transactions as a prop
- Merge transactions into the equity timeline (sorted by date alongside trade close dates)
- When a DEPOSIT occurs, equity jumps up (and peak adjusts) without counting as P&L
- When a WITHDRAWAL occurs, equity drops without counting as a loss
- Show deposit/withdrawal markers as reference dots on the chart
- Update "Starting Capital" stat to show "Net Capital Deployed" (starting + deposits - withdrawals)
- The "Total Return" calculation will subtract net capital changes so it only reflects trading P&L

### 5. Dashboard EquityCurve Widget
The dashboard's static `EquityCurve` component will also be updated to use real trade data + capital transactions instead of hardcoded mock data.

---

## Technical Details

### Files to create
- `src/hooks/useCapitalTransactions.ts` -- hook for CRUD on capital_transactions table
- `src/components/settings/CapitalManagementCard.tsx` -- UI card with transaction form + history

### Files to modify
- `src/components/analytics/EquityCurveDrawdown.tsx` -- merge capital transactions into equity timeline, add markers
- `src/components/dashboard/EquityCurve.tsx` -- replace mock data with real trades + capital transactions
- `src/components/settings/ProfileSettings.tsx` -- embed the CapitalManagementCard
- `src/pages/Analytics.tsx` -- pass capital transactions to EquityCurveDrawdown
- `src/pages/Dashboard.tsx` -- pass real data to EquityCurve widget

### Database migration
```sql
CREATE TABLE public.capital_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'DEPOSIT',
  amount numeric NOT NULL,
  transaction_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.capital_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.capital_transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.capital_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.capital_transactions
  FOR DELETE USING (auth.uid() = user_id);
```

### Equity curve calculation logic (pseudocode)
```text
1. Merge closed trades (by closed_at) and capital transactions (by transaction_date) into one sorted timeline
2. Start equity = starting_capital
3. For each event:
   - If trade: equity += pnl (track peak, drawdown as before)
   - If DEPOSIT: equity += amount, peak += amount (no P&L impact)
   - If WITHDRAWAL: equity -= amount, peak -= amount (no P&L impact)
4. Total Return = current_equity - (starting_capital + total_deposits - total_withdrawals)
```
