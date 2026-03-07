

# Fundamentals Page Polish

Looking at the screenshot vs the current code, the mobile view needs refinement for a cleaner, more readable stock screener experience.

## Key Issues Identified
- Header card too heavy for mobile — needs lighter treatment
- Preset tabs overflow poorly on mobile — only 4 quick tabs visible in screenshot (Top Gainers, Top Losers, 52W High, 52W Low) suggesting a simpler mobile tab strip
- Table rows need more breathing room and clearer visual hierarchy on mobile
- Symbol name truncation and spacing could be improved
- LTP and Change% columns need better mobile sizing
- Pagination footer could be cleaner

## Changes

### 1. Header Card (`Fundamentals.tsx` — lines 335-367)
- Reduce padding on mobile: `p-3 sm:p-4`
- Increase title to `text-xl font-bold` for better hierarchy
- Subtitle: bump to `text-[13px]` with `leading-relaxed`
- Search input: increase height to `h-9` on mobile, `text-sm` placeholder

### 2. Preset Tabs (lines 370-453)
- Add a mobile-specific quick-access row: show only the 4 most popular presets (Top Gainers, Top Losers, 52W High, 52W Low) as pill buttons on mobile
- Keep the full grouped preset bar for desktop (hidden on mobile)
- Mobile pills: `text-[13px] font-medium px-4 py-2 rounded-full` with active state using `bg-muted text-foreground`

### 3. Table Rows (lines 614-679)
- Increase row padding: `py-2.5 sm:py-2` for more breathing room on mobile
- Symbol cell: bump ticker font to `text-[14px]`, description to `text-[10px]`
- LTP display: increase integer part to `text-[14px]` for mobile readability
- Change% cell: bump to `text-[12px]` with bolder weight
- Add subtle `divide-y divide-border/30` for cleaner row separation instead of border-b

### 4. Pagination Footer (lines 687-724)
- Increase touch targets on mobile: `h-8 w-8` for page buttons
- Better mobile layout with centered page numbers

### 5. LTPDisplay Component (lines 150-174)
- Bump integer part size: `text-[14px] sm:text-[13.5px]`
- Increase rupee symbol: `text-[11px]`
- Decimal part: `text-[11px]`

### 6. Overall Table Container (line 580)
- Add `rounded-[1.25rem]` for consistency with card system
- Smoother row hover: `hover:bg-primary/[0.03]`

## Files to Edit
1. `src/pages/Fundamentals.tsx` — all changes above

