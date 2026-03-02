

# BYOK AI Insights -- Bring Your Own Key Integration

## Problem
Currently, AI Trade Insights uses the Lovable AI gateway (LOVABLE_API_KEY), which burns **your** tokens. Since this is a public-facing product, each user's insight request costs you money. Instead, users should provide their own Gemini or OpenAI API key to power insights.

## Solution
Add a "BYOK" (Bring Your Own Key) model where each user stores their own AI API key in their settings. The edge function reads the user's key from the database and calls Gemini or OpenAI directly -- zero cost to you.

---

## Changes

### 1. Database Migration
Add 2 new columns to `user_settings`:
- `ai_provider` (varchar) -- `"gemini"` or `"openai"`, default `null`
- `ai_api_key` (text) -- encrypted user API key, default `null`

### 2. Settings UI -- AI Integration Section (`IntegrationsSettings.tsx`)
Add a new card in the Integrations settings page:
- Provider selector: **Google Gemini** or **OpenAI** (tab/radio toggle)
- API key input (password field with show/hide toggle)
- "Save" button that validates the key format before saving
- Status badge showing "Connected" when key is set
- "Disconnect" button to clear the key
- Help text with links to get API keys:
  - Gemini: `aistudio.google.com/apikey`
  - OpenAI: `platform.openai.com/api-keys`

### 3. Update `useUserSettings` Hook
Add `ai_provider` and `ai_api_key` to the `UserSettings` interface so the settings UI can read/write these fields.

### 4. Rewrite Edge Function (`trade-insights/index.ts`)
- Remove the Lovable AI gateway call entirely
- Read the user's `ai_provider` and `ai_api_key` from `user_settings` (using service role key for secure read)
- If no key configured, return a friendly error: "Configure your AI API key in Settings > Integrations"
- Route to the correct endpoint:
  - **Gemini**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={KEY}`
  - **OpenAI**: `https://api.openai.com/v1/chat/completions` with Bearer token
- Keep the same stats aggregation logic (no change)
- Keep the same system prompt and structured output format
- Parse responses from each provider into the same `TradeInsight[]` shape

### 5. Update `AITradeInsights.tsx` Component
- Show a setup prompt when no AI key is configured (link to Settings > Integrations)
- Replace the empty state message: "Configure your Gemini or OpenAI API key in Settings to unlock AI-powered insights"
- Add a small badge showing which provider is active (e.g., "Powered by Gemini")

### 6. Update `useTradeInsights` Hook
- Handle the new "no API key" error gracefully with a specific toast message pointing to Settings

---

## Technical Details

### Gemini API Call Format
```typescript
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
const body = {
  contents: [{ parts: [{ text: prompt }] }],
  generationConfig: { responseMimeType: "application/json" }
};
```

### OpenAI API Call Format
```typescript
const url = "https://api.openai.com/v1/chat/completions";
const headers = { Authorization: `Bearer ${apiKey}` };
const body = {
  model: "gpt-4o-mini",
  messages: [...],
  tools: [{ type: "function", function: { name: "provide_insights", ... } }],
  tool_choice: { type: "function", function: { name: "provide_insights" } }
};
```

### Security
- API keys stored in `user_settings` table (already RLS-protected per user)
- Edge function reads keys using service role (server-side only)
- Keys never sent to the frontend beyond the settings page
- Password input field with show/hide toggle

## Files Modified
- **Database**: Add `ai_provider` and `ai_api_key` columns to `user_settings`
- **`src/hooks/useUserSettings.ts`** -- Add new fields to interface
- **`src/components/settings/IntegrationsSettings.tsx`** -- Add AI provider settings card
- **`supabase/functions/trade-insights/index.ts`** -- Replace Lovable AI with user's own Gemini/OpenAI key
- **`src/components/analytics/AITradeInsights.tsx`** -- Update empty state for unconfigured keys
- **`src/hooks/useTradeInsights.ts`** -- Handle "no key" error case

