# How to Download Your Database and Self-Host on Supabase

Step-by-step guide to migrate TradeBook from Lovable Cloud to a self-hosted Supabase instance.

---

## Overview

Your project has:
- **47 migration files** — complete database schema
- **22 Edge Functions** — backend logic
- **2 storage buckets** — trade-charts, study-attachments
- **9 database functions**, ~90 RLS policies, multiple triggers
- **10 secrets** configured for integrations

---

## Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (any OS)
npx supabase --version
```

## Step 2: Set Up Local or Self-Hosted Supabase

**Option A — Local (Docker)**
```bash
supabase init
supabase start
```

**Option B — Self-hosted remote server**
Follow: https://supabase.com/docs/guides/self-hosting/docker

## Step 3: Export Your Data (Backup)

1. Go to **Settings → Backup** tab in TradeBook
2. Click **"Full Data Backup"** → downloads JSON with all trades, journal, alerts, studies, settings
3. Click **"Trades CSV"** → optional CSV for spreadsheets

## Step 4: Apply the Database Schema

```bash
git clone <your-repo-url>
cd <your-project>
supabase link --project-ref <your-new-project-id>
supabase db push
```

This applies all 47 migrations: tables, enums, functions, RLS policies, indexes, triggers.

## Step 5: Set Up Auth Triggers

Run manually in Supabase SQL Editor:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();
```

## Step 6: Create Storage Buckets

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('trade-charts', 'trade-charts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('study-attachments', 'study-attachments', false);
```

Then add storage RLS policies for authenticated user access.

## Step 7: Deploy Edge Functions

```bash
supabase functions deploy auto-tag-trade
supabase functions deploy dhan-auth
supabase functions deploy dhan-execute
supabase functions deploy dhan-sync
supabase functions deploy dhan-verify
supabase functions deploy eod-report
supabase functions deploy evaluate-alerts
supabase functions deploy export-data
supabase functions deploy generate-weekly-report
supabase functions deploy get-live-prices
supabase functions deploy instrument-search
supabase functions deploy instrument-sync
supabase functions deploy morning-briefing
supabase functions deploy pattern-detection
supabase functions deploy suggest-alerts
supabase functions deploy telegram-notify
supabase functions deploy telegram-verify
supabase functions deploy telegram-webhook
supabase functions deploy trade-coach
supabase functions deploy trade-insights
supabase functions deploy trade-monitor
supabase functions deploy tradingview-scan
```

## Step 8: Configure Secrets

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=<your-token>
supabase secrets set DHAN_ACCESS_TOKEN=<your-token>
supabase secrets set DHAN_CLIENT_ID=<your-id>
supabase secrets set TELEGRAM_CHAT_ID=<your-chat-id>
supabase secrets set LOVABLE_API_KEY=<your-key>  # Only if using AI features
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are auto-configured.

## Step 9: Update Frontend Environment

```env
VITE_SUPABASE_URL="http://localhost:54321"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-new-anon-key>"
VITE_SUPABASE_PROJECT_ID="<your-new-project-id>"
```

## Step 10: Import Your Data

```javascript
const { createClient } = require('@supabase/supabase-js');
const backup = require('./tradebook-backup.json');

const supabase = createClient('YOUR_URL', 'YOUR_SERVICE_ROLE_KEY');

await supabase.from('trades').insert(backup.trades);
await supabase.from('trade_events').insert(backup.trade_events);
await supabase.from('alerts').insert(backup.alerts);
await supabase.from('studies').insert(backup.studies);
await supabase.from('daily_journal_entries').insert(backup.daily_journal_entries);
await supabase.from('watchlists').insert(backup.watchlists);
await supabase.from('watchlist_items').insert(backup.watchlist_items);
// ... repeat for each table
```

## Step 11: Run Locally

```bash
npm install
npm run dev
```

---

## Quick Checklist

| # | Action |
|---|--------|
| 1 | Install Supabase CLI |
| 2 | `supabase start` (local) or set up remote |
| 3 | Download backup from Settings → Backup |
| 4 | Clone repo → `supabase db push` |
| 5 | Create auth triggers in SQL Editor |
| 6 | Create storage buckets |
| 7 | Deploy 22 edge functions |
| 8 | Set secrets (Telegram, Dhan, etc.) |
| 9 | Update `.env` with new credentials |
| 10 | Import data from JSON backup |
| 11 | `npm run dev` |
