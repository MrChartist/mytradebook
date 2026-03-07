

## Fundamentals Page — Visual & UX Improvement Plan

Comparing the current implementation against the two reference screenshots, here are the targeted improvements:

---

### 1. Add Sparkline Column to Table

**Current**: No visual price trend indicator in the table rows.
**Fix**: Add a mini sparkline between the LTP and Chg% columns. Since we don't have historical intraday data per stock from the TradingView scan, we'll create a synthetic sparkline using available data points (ATL, low_52w, sma50, sma20, sma10, close) to show a relative price position curve. This gives a visual "trend shape" without extra API calls.

- Add `<Sparkline>` import from `src/components/ui/sparkline.tsx`
- New column header "Trend" between LTP and Chg%
- Width: 80px, height: 28px, with fill enabled
- Color auto-determined by up/down trend (profit/loss)

---

### 2. Improve LTP Display

**Current**: Plain `₹1,404.80` in mono font, no visual weight distinction.
**Fix**:
- Split the integer and decimal parts: bold integer `₹1,404` + lighter `.80`
- Slightly larger font for the integer part (`text-[14px]`) and muted smaller decimals (`text-[11px] text-muted-foreground`)
- This matches professional terminal aesthetics where the integer price is the focus

---

### 3. Cleaner Preset Bar (matching reference image-80)

**Current**: Colored dots before groups, tiny `10px` text, crowded dividers.
**Fix** (matching the reference):
- Increase preset button text to `text-[11px]` for better readability
- Keep colored dot separators between groups but make them slightly larger (`w-2 h-2`)
- Add more horizontal spacing between groups (`mx-2` instead of `mx-1`)
- Make active preset have a subtle bottom-border style instead of full filled button — use `variant="ghost"` with `border-b-2 border-primary rounded-none` for the active state (cleaner, like the reference)

---

### 4. Table Header Improvements

**Current**: Sort headers are functional but visually flat.
**Fix**:
- Add a subtle bottom border highlight on the sorted column header (`border-b-2 border-primary` on active sort)
- Make sort arrows slightly more visible — increase opacity from `0.30` to `0.40` for inactive arrows
- Add `↕` unicode symbol in headers for sortable columns (matching reference's `↕` indicators)

---

### 5. Sector Column — Pill Style (matching reference)

**Current**: Plain muted text for sector.
**Fix**: Use a subtle filled pill/badge style matching the reference — small rounded chip with `bg-muted/60 px-2 py-0.5 rounded text-[10px] font-medium` — compact but with enough contrast to distinguish sectors visually.

---

### 6. Row Hover & Selection Polish

**Current**: Basic `hover:bg-muted/40`.
**Fix**:
- Add a left border accent on hover: `hover:border-l-2 hover:border-primary` for a professional touch
- Slightly increase hover bg to `hover:bg-muted/50`

---

### 7. Header Card — Match Reference Layout

**Current**: Icon + "Stock Scanner" title.
**Fix** (matching reference image-79):
- Change title to "Fundamentals" with subtitle "Top NSE stocks by market cap with key metrics"
- Remove the icon box — just use clean text like the reference
- Keep stock count and search on the right

---

### Files to Edit
- `src/pages/Fundamentals.tsx` — all changes in this single file

### Summary of Visual Changes
- Sparkline trend column added to table
- LTP split into bold integer + light decimals  
- Preset bar cleaned up with better spacing and active-border style
- Sector shown as subtle pill chips
- Row hover gets left-border accent
- Header simplified to match reference
- Sort indicators improved

