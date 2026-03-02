

# Redesign Dashboard Sidebar -- SmartShort-Inspired Style

## Inspiration (from screenshot)
The reference sidebar features:
- A bold **left accent bar** (green/lime) on the active nav item
- Active item has a subtle translucent background fill
- Clean **uppercase section labels** ("MAIN MENU", "PROJECTS") with generous spacing
- Generous vertical padding on each nav item for a spacious feel
- Minimal, modern aesthetic with clear visual hierarchy

## Changes

### 1. Update active nav item style (`Sidebar.tsx`)
- Add a **3px left accent bar** (primary/orange color) on active items using a `before` pseudo-element or a left-border approach
- Keep the translucent `bg-primary/8` background on active items
- Increase nav item padding slightly (`py-2.5` instead of `py-2`) for a more spacious feel
- Use `rounded-lg` (instead of `rounded-xl`) to match the tighter, modern look from the reference
- Add a subtle left-border glow effect on hover items

### 2. Improve section labels (`Sidebar.tsx` + `index.css`)
- Increase section label font size slightly (from `10px` to `11px`)
- Add more top margin between sections (`mt-6` instead of `mt-5`)
- Keep the uppercase tracking style (already matches the reference well)

### 3. Add accent bar CSS class (`index.css`)
- Create a `.nav-active-bar` utility with a `before` pseudo-element:
  - 3px wide, primary-colored rounded bar on the left edge
  - Positioned absolutely, centered vertically, ~60% height of the item

### Files Modified
- **`src/components/layout/Sidebar.tsx`** -- Update `renderNavItem` classes for active bar + spacing
- **`src/index.css`** -- Add `.nav-active-bar` utility class, tweak section label

### Technical Details

**Active bar approach** (CSS pseudo-element in `index.css`):
```css
.nav-active-bar {
  position: relative;
}
.nav-active-bar::before {
  content: '';
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 15%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: hsl(var(--primary));
}
```

**Nav item class updates** (`renderNavItem` in Sidebar.tsx):
- Active: add `nav-active-bar` class, keep `bg-primary/8 text-primary font-medium`
- Default: `text-muted-foreground hover:text-foreground hover:bg-muted/60`
- Change `rounded-xl` to `rounded-lg`, increase `py-2` to `py-2.5`

No functional changes -- purely visual refinement to match the premium SmartShort aesthetic.

