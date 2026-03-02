

# Add AI API Integration Section to Documentation

## Your Approach is Correct

You're right to prioritize **Google Gemini** over OpenAI for your users:

- **Gemini API** is free to use via Google AI Studio with generous limits (15 requests/minute, 1M tokens/day on Flash models) -- more than enough for daily trade analysis
- **OpenAI** requires paid credits from day one -- no free tier for API usage
- For a public product, recommending Gemini first means most users will never need to pay anything for AI insights

The docs section will strongly recommend Gemini as the primary/default choice and position OpenAI as an alternative for users who prefer it.

---

## Changes

### 1. New `AIApiSetupMockup` Visual Component (`DocsMockups.tsx`)
Create a new mockup showing the BYOK setup flow:
- A visual "step-by-step" diagram: **Get Free Key** -> **Paste in Settings** -> **Analyze Trades**
- A side-by-side provider comparison card showing Gemini (recommended, free) vs OpenAI (paid)
- A mini mockup of the Settings Integrations panel showing the provider toggle and API key input
- Use a "Recommended" badge on the Gemini side and a "Free" badge
- Visual of a sample AI insight card output (reuse existing AIInsightsMockup style)

### 2. Add "AI Integration" to Docs Sections Sidebar (`Docs.tsx`)
- Add a new `SECTIONS` entry: `{ id: "ai-integration", label: "AI Insights Setup", icon: Sparkles }`
- Place it in the "Settings & Tools" sidebar group, before "integrations"
- Or place it inside the existing Integrations section as a prominent sub-card

### 3. Add AI Integration Documentation Section (`Docs.tsx`)
Add a new section with:
- **SectionHeader**: "AI Trade Insights" with description about BYOK model
- **AIApiSetupMockup**: The visual flow diagram
- **FeatureCard: "Google Gemini (Recommended)"**: Step-by-step guide to get a free API key from aistudio.google.com/apikey, with emphasis on the free tier
- **FeatureCard: "OpenAI (Alternative)"**: Brief guide for users who prefer OpenAI, noting it requires paid credits
- **FeatureCard: "How It Works"**: Explanation of what the AI analyzes (aggregated stats, not raw data), what insights it provides, and the privacy model (your key, your cost, server-side only)

### 4. Update Existing Integrations Section
- Add a reference/link to the new AI section from the existing Integrations section
- Update `SettingsIntegrationsMockup` or add a note about AI provider settings being available

---

## Technical Details

### New Mockup: `AIApiSetupMockup`
A 3-step flow visual similar to `OnboardingFlowMockup`:
1. Step 1: "Get Free API Key" -- Google AI Studio link
2. Step 2: "Paste in Settings" -- Settings > Integrations
3. Step 3: "Get AI Insights" -- Analyze button

Plus a provider comparison card:
```
| Google Gemini (Recommended)  |  OpenAI           |
| Free tier: 15 RPM            |  Paid credits only |
| 1M tokens/day free           |  Pay-per-token     |
| Gemini Flash model           |  GPT-4o Mini       |
```

### New Mockup: `AISettingsPreviewMockup`
A mini version of the Integrations settings card showing:
- Gemini/OpenAI tab toggle (Gemini selected)
- API key input field (masked)
- "Save & Connect" button
- "Connected" status badge

### Section Content Structure
- Strongly recommend Gemini with "Free" and "Recommended" badges
- Explain the BYOK model: "Your key, your cost, zero cost on our end"
- Privacy note: "Your API key is stored securely and only used server-side. We never see your key."
- Link to aistudio.google.com/apikey for getting a free Gemini key

### Files Modified
- **`src/components/docs/DocsMockups.tsx`** -- Add `AIApiSetupMockup`, `AIProviderComparisonMockup`, `AISettingsPreviewMockup`
- **`src/pages/Docs.tsx`** -- Add new "AI Insights Setup" section with FeatureCards, update SECTIONS array and sidebar groups, import new mockups

