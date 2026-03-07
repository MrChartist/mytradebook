

## Fundamentals Page — UI/UX Improvement Plan

Comparing the current implementation against the reference screenshot, here are the key issues and proposed fixes:

### Problems Identified

1. **Preset bar is too busy** — Group labels, filter icons on every button, and dividers create visual noise. The reference shows clean pill-style chips with colored dots, no icons on every chip.

2. **Table row density is off** — Current rows have generous padding (`py-2.5 px-3`) making the table feel sparse. The reference shows a tighter, data-dense layout better suited for a screener with 15+ columns.

3. **Sector badges are bulky** — Using `<Badge>` with background fills takes up space. The reference shows plain colored text labels for sectors, much more compact.

4. **Change% indicator is over-styled** — Current uses a pill with a dot + background + rounded-full. The reference uses a simple dot + colored text, saving horizontal space.

5. **Header card wastes vertical space** — The header takes significant vertical real estate. Could be more compact.

6. **Sticky column lacks visual separation** — The frozen Symbol column needs a subtle right-border/shadow so it doesn't blend into scrolled content.

7. **No zebra striping polish** — Current alternating rows use `bg-muted/20` which is barely visible. Needs slightly stronger contrast.

8. **Pagination footer could be slimmer** — Takes too much vertical space for its function.

---

### Implementation Plan

#### 1. Compact the Header
- Reduce padding from `p-5` to `p-4`
- Make title and stock count inline on one line
- Shrink search input height

#### 2. Redesign Preset Chips Bar
- Remove `<Filter>` icon from every preset button — only show on the active one
- Use smaller, tighter pills with colored left-dot indicators per group (orange for cap, green for fundamental, blue for technical)
- Replace group label text with a compact colored dot separator

#### 3. Tighten Table Density
- Reduce cell padding from `py-2.5 px-3` to `py-2 px-3`
- Reduce header row height
- Make Symbol column font slightly smaller (`text-[13px]`) and description `text-[9px]`
- Replace Sector `<Badge>` with plain colored text (`text-[11px]`)

#### 4. Simplify Change% Display
- Replace the pill-style indicator with a simple dot + colored text (no background pill)
- More compact: `● +1.11%` instead of a full rounded-full badge

#### 5. Add Sticky Column Shadow
- Add a right box-shadow/border to the sticky Symbol column: `shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]`

#### 6. Improve Zebra Striping
- Increase alternating row contrast from `bg-muted/20` to `bg-muted/30`

#### 7. Slim Down Pagination
- Reduce padding from `p-3` to `p-2.5`
- Make row count text more compact

#### 8. ROE/Net Margin Color Logic
- Show dash (`—`) in muted color instead of red for null/zero values — currently nulls show as red which is misleading

### Files to Edit
- `src/pages/Fundamentals.tsx` — All changes are in this single file (header, presets, table, pagination)

### Expected Impact
- ~15-20% vertical space savings in the header/preset area
- Denser, more professional data table matching financial terminal aesthetics
- Better readability of the sticky column during horizontal scroll
- Cleaner preset bar with less visual clutter

