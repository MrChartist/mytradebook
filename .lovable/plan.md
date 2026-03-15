

# How to Download Your Database and Self-Host on Supabase

This is a step-by-step guide to migrate your Tradebook project from Lovable Cloud to a self-hosted Supabase instance.

---

## Overview

Your project has:
- **47 migration files** that define the complete database schema
- **22 Edge Functions** for backend logic
- **2 storage buckets** (trade-charts, study-attachments)
- **9 database functions**, ~90 RLS policies, and multiple triggers
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

## Step 2: Set Up a Local or Self-Hosted Supabase

**Option A — Local (Docker)**
```bash
supabase init
supabase start
```
This spins up Postgres, Auth, Storage, Edge Functions locally via Docker.

**Option B — Self-hosted remote server**
Follow the official guide: https://supabase.com/docs/guides/self-hosting/docker

## Step 3: Export Your Data (Backup)

Before migrating, download all your data from the live app:

1. **Go to Settings → Backup tab** in your Tradebook app
2. Click **"Full Data Backup"** → downloads a JSON file with all your trades, journal entries, alerts, studies, settings, etc.
3. Click **"Trades CSV"** → downloads trades as CSV (optional, for spreadsheet use)

This JSON backup will be used to re-import data into your new database.

## Step 4: Apply the Database Schema

Your project already has all 47 migration files in `supabase/migrations/`. These contain the complete schema — tables, enums, functions, RLS policies, indexes, triggers, everything.

```bash
# Clone your repo from GitHub (connect GitHub in Lovable Settings first)
git clone <your-repo-url>
cd <your-project>

# Link to your new Supabase project (or local instance)
supabase link --project-ref <your-new-project-id>

# Apply all migrations in order
supabase db push
```

This will create all 38+ tables, enums, functions, RLS policies, indexes, and triggers automatically.

## Step 5: Set Up the Auth Trigger

The `handle_new_user` function needs a trigger on `auth.users`. This cannot be done via migrations — you must run this manually in the Supabase SQL Editor:

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

In the Supabase dashboard (or SQL Editor):

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('trade-charts', 'trade-charts', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('study-attachments', 'study-attachments', false);
```

Then add storage RLS policies to allow authenticated users to upload/read their own files.

## Step 7: Deploy Edge Functions

```bash
# Deploy all 22 edge functions at once
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

Set these secrets on your new Supabase instance:

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=<your-token>
supabase secrets set DHAN_ACCESS_TOKEN=<your-token>
supabase secrets set DHAN_CLIENT_ID=<your-id>
supabase secrets set TELEGRAM_CHAT_ID=<your-chat-id>
supabase secrets set LOVABLE_API_KEY=<your-key>  # Only if using Lovable AI features
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are auto-configured by Supabase.

## Step 9: Update Your Frontend Environment

Create a `.env` file pointing to your new instance:

```env
VITE_SUPABASE_URL="http://localhost:54321"          # or your self-hosted URL
VITE_SUPABASE_PUBLISHABLE_KEY="<your-new-anon-key>"
VITE_SUPABASE_PROJECT_ID="<your-new-project-id>"
```

## Step 10: Import Your Data

Write a simple script or use the Supabase SQL editor to import the JSON backup from Step 3. For example:

```javascript
// Node.js script example
const { createClient } = require('@supabase/supabase-js');
const backup = require('./tradebook-backup.json');

const supabase = createClient('YOUR_URL', 'YOUR_SERVICE_ROLE_KEY');

// Import trades
await supabase.from('trades').insert(backup.trades);
await supabase.from('trade_events').insert(backup.trade_events);
await supabase.from('alerts').insert(backup.alerts);
// ... repeat for each table in the backup
```

## Step 11: Run Locally

```bash
npm install
npm run dev
```

Your app will now connect to your self-hosted Supabase instance.

---

## Summary Checklist

| Step | Action |
|------|--------|
| 1 | Install Supabase CLI |
| 2 | Start local Supabase (`supabase start`) |
| 3 | Download data backup from Settings → Backup |
| 4 | Clone repo, run `supabase db push` |
| 5 | Create auth triggers manually in SQL editor |
| 6 | Create storage buckets |
| 7 | Deploy all 22 edge functions |
| 8 | Set secrets (Telegram, Dhan, etc.) |
| 9 | Update `.env` with new Supabase credentials |
| 10 | Import data from JSON backup |
| 11 | Run `npm run dev` |

---

## What Lovable Can Do for You

If you'd like, I can **generate a single combined SQL file** (`tradebook-full-schema.sql`) that merges all 47 migrations into one clean, runnable file. This would let you skip `supabase db push` and just paste it directly into any Supabase SQL editor. Let me know if you want that.

