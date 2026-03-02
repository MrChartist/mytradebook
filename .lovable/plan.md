

# Refine Testimonials Section

## Current State
3 testimonials in a 3+2 column bento layout (1 large featured card on the left, 2 smaller cards stacked on the right). The content and layout match the screenshot reference well. The section works but can be more impactful with richer content and polish.

## Improvements

### 1. Add 2 More Testimonials (Total: 5)
Expand from 3 to 5 testimonials to fill a richer layout. New testimonials:
- **Vikram T.** -- Scalper, Hyderabad -- focuses on the trading rules checklist helping him avoid revenge trading
- **Sneha R.** -- Positional Trader, Pune -- highlights the Telegram alerts and EOD report features

### 2. New Layout: 3-Column Masonry-Style Grid
Replace the current 3+2 split with a more dynamic layout:
- **Row 1**: 1 large featured card (col-span-2) + 1 regular card (col-span-1)
- **Row 2**: 1 regular card (col-span-1) + 1 large featured card (col-span-2)
- This creates a zigzag visual rhythm that feels more dynamic than the current stacked right column
- Uses `grid-cols-1 md:grid-cols-3` with alternating `col-span-2` placement
- The 5th testimonial sits as a full-width accent strip below the grid

### 3. Visual Enhancements per Card
- Add a subtle **highlight keyword** in each quote using accent color (the key metric or feature mentioned)
- Add a **trading style tag** pill below each name (e.g., "Options", "Swing", "F&O", "Scalping", "Positional") -- gives immediate context
- Featured cards get a subtle `dot-pattern` background texture for depth
- Smaller cards get a subtle left accent border on hover (`border-l-2 border-[hsl(var(--tb-accent))]`)

### 4. Bottom Stats Strip
Below the testimonial cards, add a horizontal stats strip:
- "4.9/5 average rating" with filled stars
- "1,200+ active traders"
- "42,000+ trades tracked"
- Displayed as inline pill badges in a centered flex row with subtle separators

### 5. Section Background
Add a subtle `dot-pattern` background to the section for consistency with other sections.

## Technical Changes

### File: `src/pages/Landing.tsx`

**Testimonials data array (lines 116-120):**
- Add 2 new testimonials (Vikram T. and Sneha R.) with a `style` field for the trading style tag
- Add `highlight` field to each testimonial containing the key phrase to accent-color

**Section wrapper (line 1187):**
- Add `dot-pattern` class to section background

**Grid layout (lines 1200-1254):**
- Replace the current `grid-cols-5` layout with a new `grid-cols-1 md:grid-cols-3` grid
- First row: featured card (`md:col-span-2`) + regular card (`md:col-span-1`)
- Second row: regular card (`md:col-span-1`) + featured card (`md:col-span-2`)
- 5th testimonial as a full-width card below with a different style (horizontal layout, accent border)

**Card internals:**
- Add trading style pill below the name/role (`bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px]`)
- Highlight key phrases in quotes by wrapping them in `<span className="text-[hsl(var(--tb-accent))] font-semibold">`

**Stats strip (after grid, before section close):**
- Add a centered flex row with 3 stat pills separated by dot dividers

### No new files or dependencies needed

