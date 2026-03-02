

# Docs Page UI Improvements + Black & White Toggle

## Overview
Improve the overall Docs page UI for better readability and visual polish, and add a "Black & White" toggle that lets users switch all mockup visuals between full-color and grayscale mode.

---

## 1. Black & White / Color Toggle

**What it does:** A toggle placed in the Docs hero section (next to the "Documentation" badge) that switches between "Color" and "B&W" modes. When B&W is active, all mockups render in grayscale — useful for users who want a cleaner, distraction-free reading experience or to preview how mockups look without color dependency.

**Implementation:**
- Create a `DocsColorMode` React context/state at the top of the Docs page (`useState<'color' | 'bw'>('color')`)
- Add a styled toggle button in the hero area with Sun/Moon-like icons (e.g., `Palette` / `Circle` from lucide) labeled "Color" / "B&W"
- Pass the mode down via a context provider wrapping all doc content
- In `DocsMockups.tsx`, update the `MockupFrame` component to apply a CSS `filter: grayscale(100%)` class when B&W mode is active
- This single CSS filter on the wrapper gracefully converts all child colors (SVGs, backgrounds, text colors) to grayscale without touching individual mockup code

**Toggle design:**
- Two-button pill toggle (similar to the existing `ViewToggle` component pattern)
- Left: color palette icon + "Color" label
- Right: circle icon + "B&W" label
- Active state uses `bg-primary/10 text-primary` styling

---

## 2. Docs UI Improvements

### 2a. Hero Section Polish
- Tighten vertical spacing (reduce `py-16 lg:py-24` to `py-12 lg:py-16`)
- Add a subtle top border accent line (3px primary gradient) at the very top of the page
- Place the B&W toggle inline with the "Documentation" badge for quick access

### 2b. Sidebar Refinements
- Add a thin left accent bar on the active sidebar item (3px primary-colored, matching the dashboard sidebar pattern)
- Slightly increase sidebar item padding for better touch targets
- Add a divider line between sidebar groups

### 2c. Section Spacing & Cards
- Reduce gap between mockup visuals and their corresponding FeatureCard from implicit spacing to a tighter `mb-3` for better visual connection
- Add a subtle top border accent on each SectionHeader (a small colored line above the icon)
- Improve FeatureCard hover state with a slight scale transform (`hover:scale-[1.005]`)

### 2d. Mobile Improvements
- Increase mobile tab pill size slightly for better tappability
- Add shadow under the sticky mobile tab bar for depth separation

### 2e. Typography & Contrast
- Bump section description text from `text-muted-foreground` to slightly higher contrast
- Make FeatureList chevron icons slightly larger for better visual hierarchy

---

## Technical Details

### Files to Modify

1. **`src/pages/Docs.tsx`**
   - Add `colorMode` state and context provider
   - Add B&W/Color toggle in the hero section
   - Pass `colorMode` to mockup components via context
   - Apply UI spacing and styling improvements to SectionHeader, FeatureCard, sidebar, and mobile tabs

2. **`src/components/docs/DocsMockups.tsx`**
   - Import and consume the color mode context
   - Update `MockupFrame` to conditionally apply `grayscale` filter class
   - Export the context so both files can share it

### New Context (in DocsMockups.tsx)
```typescript
import { createContext, useContext } from "react";
export const DocsColorModeContext = createContext<'color' | 'bw'>('color');
export const useDocsColorMode = () => useContext(DocsColorModeContext);
```

### MockupFrame Update
```typescript
function MockupFrame({ children, className }) {
  const colorMode = useDocsColorMode();
  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-muted/20 dot-pattern p-4 md:p-6 overflow-hidden",
      colorMode === 'bw' && 'grayscale',
      className
    )}>
      {children}
    </div>
  );
}
```

### CSS Addition (in `src/index.css`)
```css
.grayscale {
  filter: grayscale(100%);
  transition: filter 0.3s ease;
}
```

### Toggle Component (inline in Docs.tsx)
A pill-shaped toggle similar to the existing ViewToggle, placed in the hero next to the Documentation badge.

---

## Summary of Changes
- 3 files modified: `Docs.tsx`, `DocsMockups.tsx`, `index.css`
- No new dependencies needed
- Grayscale filter approach means zero changes to individual mockup components
- Toggle state persists only during the session (no localStorage needed)

