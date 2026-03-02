

# Improve "Why TradeBook?" Comparison Section

## Current Issues
- Plain grid layout lacks visual polish compared to the reference image
- No row hover effects or staggered animations
- "Others" column badges (Paid, Limited) are too subtle
- Missing more comparison features that highlight TradeBook's strengths
- No summary CTA at the bottom of the table
- Alternating row colors are barely visible

## Improvements

### 1. Add More Comparison Rows
Expand from 8 to 10 rows, adding:
- **AI-powered insights** (TradeBook: check, Others: false)
- **Position sizing calculator** (TradeBook: check, Others: "Basic")

### 2. Visual Polish for Table
- **Row hover**: Add `hover:bg-[hsl(var(--tb-accent)/0.04)]` with smooth transition for interactive feel
- **Alternating rows**: Increase contrast from `bg-muted/[0.04]` to `bg-muted/10` so zebra striping is visible
- **TradeBook check icons**: Use filled green circles with a subtle glow (`drop-shadow-[0_0_4px_rgba(34,197,94,0.3)]`)
- **"Others" badges** (Paid, Limited): Use a more visible pill style with `bg-destructive/10 text-destructive border border-destructive/20` to emphasize the competitor disadvantage
- **Others dash icon**: Slightly larger and more visible `text-muted-foreground/40`

### 3. Staggered Row Animations
Each row animates in with a slight delay using `custom={i * 0.05}` on the fadeUp variant, creating a cascading reveal effect as the section scrolls into view.

### 4. Bottom CTA Strip
Add a rounded footer row at the bottom of the table with:
- "All features included in free beta" text on the left
- "Start Free" button on the right linking to `/login?mode=signup`
- Accent background tint: `bg-[hsl(var(--tb-accent)/0.06)]`

### 5. Header Row Styling
- Make "Feature" column header bolder (`font-semibold text-foreground`)
- Add a small crown/trophy icon next to "TradeBook" header text
- Slightly larger header padding (`py-5`)

## Technical Changes

### File: `src/pages/Landing.tsx`

**Data array (~line 150-159):**
- Add 2 new rows to `comparisonFeatures` array

**Comparison section (~line 1057-1092):**
- Update header row with trophy icon and bolder styling
- Update row rendering with hover effect, improved badge styles, and green glow on check icons
- Add bottom CTA row after the map
- Increase stagger delay on `custom` prop

**Imports:**
- Add `Trophy` icon from lucide-react (if not already imported)

### No other files changed

