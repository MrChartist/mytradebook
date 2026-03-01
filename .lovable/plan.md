

# AI-Powered Trade Insights

## Overview

Add an AI coach that analyzes your closed trades, patterns, mistakes, and behavioral data to generate personalized improvement suggestions. The insights appear as a new dashboard widget and a dedicated section on the Analytics page.

## How It Works

1. You click "Get AI Insights" (or it refreshes weekly)
2. Your trade data (closed trades, patterns, mistakes, streaks, segment performance) is summarized into anonymized statistics on the backend
3. The backend sends these stats to Lovable AI (Gemini) with a trading coach system prompt
4. You receive 3-5 actionable insights like "Your Options win rate drops 40% after 2pm -- consider avoiding afternoon entries" or "Your best setups use the Bull Flag pattern with 72% win rate -- lean into it"

## Architecture

```text
[Analytics Page / Dashboard Widget]
        |
        | Click "Get Insights" 
        v
[useTradeInsights hook]
        |
        | supabase.functions.invoke("trade-insights", { period: "30d" })
        v
[Edge Function: trade-insights]
        |
        | 1. Fetch user's closed trades, patterns, mistakes from DB
        | 2. Compute summary stats (win rate by segment, time, day, patterns, mistakes)
        | 3. Send stats to Lovable AI Gateway with trading coach prompt
        | 4. Return structured insights
        v
[UI renders insight cards with icons + actionable tips]
```

## What the AI Analyzes

- Win rate by segment, time of day, day of week
- Most profitable vs least profitable patterns/setups
- Repeat mistakes and their financial impact
- Risk-reward ratios and position sizing habits
- Streak data (winning/losing streaks and behavior after streaks)
- Holding time analysis (are you exiting too early or too late?)
- Confidence score vs actual outcomes (are high-confidence trades actually better?)

## New Files

### 1. Edge Function: `supabase/functions/trade-insights/index.ts`

- Authenticates the user via JWT
- Fetches closed trades, trade_patterns, trade_mistakes for the user (last 30/90/all days based on param)
- Computes a statistical summary (no raw trade data sent to AI -- just aggregated numbers)
- Calls Lovable AI Gateway with a system prompt: "You are a trading performance coach. Analyze these statistics and provide 3-5 specific, actionable insights..."
- Uses tool calling to return structured output: `{ insights: [{ title, description, category, severity }] }`
- Returns the insights array

### 2. Hook: `src/hooks/useTradeInsights.ts`

- Calls the edge function with period filter
- Caches results in React Query (staleTime: 1 hour)
- Provides `insights`, `isLoading`, `refresh` to components

### 3. Component: `src/components/analytics/AITradeInsights.tsx`

- Displays insight cards with category icons (behavioral, timing, risk, pattern)
- Each card has a title, description, and severity indicator (info/warning/success)
- "Refresh Insights" button with loading state
- Gated behind PlanGate (Pro feature)

### 4. Dashboard Widget Integration

- Add "aiInsights" to the dashboard widget list in `useDashboardLayout.ts`
- Show a compact version (top 2 insights) on the Dashboard
- Full version on the Analytics page

## Data Privacy

- Raw trade data never leaves the backend
- Only aggregated statistics (counts, percentages, averages) are sent to the AI
- No symbol names, prices, or personal info included in the AI prompt

## UI Design

Each insight card shows:
- Category icon (brain for behavioral, clock for timing, shield for risk, target for patterns)
- Title: "Afternoon Options Trading Underperforms"
- Description: "Your win rate drops from 65% to 38% for Options trades taken after 2:00 PM. Consider restricting entries to morning sessions."
- Severity badge: info (blue), warning (amber), success (green)

## Files Modified

1. `supabase/functions/trade-insights/index.ts` -- NEW edge function
2. `supabase/config.toml` -- register function with `verify_jwt = false`
3. `src/hooks/useTradeInsights.ts` -- NEW hook
4. `src/components/analytics/AITradeInsights.tsx` -- NEW component
5. `src/pages/Analytics.tsx` -- add AITradeInsights section
6. `src/hooks/useDashboardLayout.ts` -- add "aiInsights" widget
7. `src/pages/Dashboard.tsx` -- render compact insights widget

