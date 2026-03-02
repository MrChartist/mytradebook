

# Docs Page - Dark & White Brainstorm Aesthetic Redesign

## Overview
Transform the Docs page into a clean, high-contrast **black and white brainstorm** aesthetic -- think whiteboard/notebook style with crisp typography, monochrome mockups, and refined micro-details throughout.

---

## 1. Global Docs Color Mode: Black & White

**Add a B&W toggle** in the hero section (pill-shaped toggle next to the "Documentation" badge):
- **Color mode**: Full-color mockups (current)
- **B&W mode**: All mockups and accent colors shift to grayscale -- clean, distraction-free, brainstorm-board feel

**Implementation:**
- Create a `DocsColorModeContext` in `DocsMockups.tsx` with `'color' | 'bw'` state
- Wrap the Docs page content in the provider
- `MockupFrame` applies `filter: grayscale(100%)` + slightly reduced opacity when B&W mode is active
- Add a `.docs-bw` class to the page root that overrides accent colors to neutral grays

---

## 2. Hero Section Polish

- Add a thin **3px gradient accent bar** at the very top of the page (primary gradient in color mode, solid dark in B&W)
- Tighten padding from `py-16 lg:py-24` to `py-12 lg:py-16`
- Place the **Color/B&W toggle** inline next to the "Documentation" badge
- Make the hero subtitle slightly higher contrast (`text-foreground/70` instead of `text-muted-foreground`)

---

## 3. Sidebar Micro-Details

- Add a **3px left accent border** on the active sidebar item (matching the dashboard sidebar pattern)
- Add subtle **separator lines** between logical sidebar groups (Getting Started | Core Features | Advanced | Settings)
- Slightly bump padding for better touch targets (`py-2.5` instead of `py-2`)

---

## 4. Section Headers Refinement

- Add a small **top accent line** (40px wide, 3px tall) above each section header icon
- Increase the section description contrast (`text-foreground/60` instead of pure `text-muted-foreground`)
- Add subtle `border-b border-border/10 pb-6` below each section header for cleaner separation

---

## 5. FeatureCard Attention to Detail

- Add a subtle **left accent bar** (3px, rounded, primary-colored) on hover
- Improve hover: `hover:shadow-md hover:scale-[1.003]` for micro-lift feel
- Icon container: add a subtle `ring-1 ring-border/20` for depth
- Badge: slightly increase font size to `text-[11px]` for readability
- FeatureList chevrons: bump to `w-4.5 h-4.5` for better visual weight

---

## 6. MockupFrame B&W Mode Styling

When B&W is active:
- Apply `grayscale` CSS filter on `MockupFrame`
- Remove the `dot-pattern` background (replace with clean white/dark bg)
- Add a subtle **sketch-style border** feel: `border-dashed border-foreground/20`
- Reduce `hover:scale` to `hover:scale-[1.005]` for subtlety

---

## 7. Mobile Tab Bar Improvements

- Increase pill size: `px-4 py-2` (from `px-3 py-1.5`)
- Add `shadow-sm` under the sticky tab bar for depth separation
- Active pill: add subtle `ring-1 ring-primary/30`

---

## 8. Typography & Spacing Fine-Tuning

- FeatureCard title: bump to `text-lg font-bold` (ensure consistent)
- Section spacing: keep `space-y-20` but add `mt-2` gap between consecutive FeatureCards within a section (currently they stack tight)
- Inner text in mockups: ensure minimum `text-[10px]` for readability
- Add `leading-relaxed` to all description paragraphs consistently

---

## 9. CSS Addition

Add to `src/index.css`:
```css
.grayscale {
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}

.docs-bw .gradient-text {
  background-image: none;
  color: hsl(var(--foreground));
}
```

---

## Technical Changes

### Files Modified:
1. **`src/components/docs/DocsMockups.tsx`** -- Add `DocsColorModeContext`, update `MockupFrame` with grayscale support
2. **`src/pages/Docs.tsx`** -- Add B&W toggle, context provider, sidebar accent bars, section header refinements, FeatureCard hover improvements, mobile tab polish
3. **`src/index.css`** -- Add `.grayscale` and `.docs-bw` utility classes

### No new dependencies needed.

