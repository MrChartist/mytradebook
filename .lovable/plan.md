
# Typography System Update Plan

## Summary
Update TradeBook to a 4-font system: **Manrope** (headings), **Instrument Serif** (accent words), **Inter** (all UI), **JetBrains Mono** (code/technical). This replaces the current Libre Bodoni + Source Sans 3 setup.

---

## Technical Changes

### 1. Google Fonts — `index.html`
Replace current font imports with:
- Manrope: 500, 600, 700
- Instrument Serif: 400, 400i
- Inter: 400, 500, 600, 700
- JetBrains Mono: 400, 500

Preload Inter (primary UI font) for fastest FCP.

### 2. Tailwind Config — `tailwind.config.ts`
Update `fontFamily`:
```
heading: ["Manrope", "system-ui", "sans-serif"]
accent: ["'Instrument Serif'", "Georgia", "serif"]
sans: ["Inter", "system-ui", "sans-serif"]
mono: ["'JetBrains Mono'", "monospace"]
```
Remove `font-display` (was Libre Bodoni) and `font-logo`.

### 3. CSS Design System — `src/index.css`
- Update header comments to reflect new font system
- Define `.accent-serif` utility for Instrument Serif accent words
- Define `.font-heading` utility for Manrope headings
- Update `.docs-title` classes to use Manrope

### 4. Landing Page Components
Files: `HeroSection.tsx`, `FeaturesSection.tsx`, `BelowFoldSections.tsx`, `LandingShared.tsx`
- Replace `font-display` → `font-heading` on all section headings
- Update `.accent-script` → `.accent-serif` for highlighted words
- Ensure Inter is applied globally via `font-sans`

### 5. Auth Pages
Files: `Login.tsx`, `ResetPassword.tsx`
- Replace `font-display` → `font-heading` on form titles
- Remove `font-dancing` references

### 6. Docs Page
File: `src/pages/Docs.tsx`
- Replace `font-display` → `font-heading` on docs titles
- Update `.docs-hero-title` to use Manrope

### 7. Dashboard & App UI
Files: `PageHeader.tsx`, `StatCard.tsx`, `DashboardKPICards.tsx`, `Sidebar.tsx`
- App page titles: `font-heading`
- All body/UI text: `font-sans` (Inter)
- Code blocks/metrics: `font-mono`

### 8. Global Button & Card Titles
Components already inherit `font-sans`; ensure card titles use `font-heading` where appropriate.

---

## Accent Usage Guidelines (Instrument Serif)
Apply `.accent-serif` **only** to:
- 1-2 words in hero headlines ("Know Your *Edge*")
- Section heading accents ("*transparent* pricing")
- Premium marketing emphasis

Never use for body text, buttons, or functional UI.

---

## Files to Edit
1. `index.html` — font imports
2. `tailwind.config.ts` — font families
3. `src/index.css` — utilities and system comments
4. `src/components/landing/HeroSection.tsx`
5. `src/components/landing/FeaturesSection.tsx`
6. `src/components/landing/BelowFoldSections.tsx`
7. `src/components/landing/LandingShared.tsx`
8. `src/pages/Login.tsx`
9. `src/pages/ResetPassword.tsx`
10. `src/pages/Docs.tsx`
11. `src/components/ui/page-header.tsx`

---

## Result
- Modern, advanced SaaS typography
- Clear hierarchy: Manrope headings, Inter UI, Instrument Serif accents
- Consistent across landing, docs, dashboard, and all product pages
- Production-ready and unified
