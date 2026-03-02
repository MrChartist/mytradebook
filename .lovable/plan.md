

# Improve "Built for Indian Markets" Section

## Current State
The section has a 2-column layout with text on the left and segment pills on the right. It works but the right side feels empty -- just floating pills with no visual anchor. The reference image confirms this sparse feel.

## Improvements

### 1. Right-Side Visual Anchor -- Mock Exchange Card
Replace the floating pills with a structured "exchange card" mockup that looks like a real UI panel:
- A mini card with a header "Market Segments" and the segment pills arranged in a neat 2x3 grid inside it
- Below the pills, show a mini "market status" strip: a green dot with "Market Open -- 09:15 AM to 03:30 PM IST"
- Add a subtle decorative Indian flag gradient stripe (saffron-white-green) at the top of the card (3px height)
- The card itself uses `bg-card rounded-2xl border shadow-sm` to look like an actual UI component

### 2. Segment Pills -- Interactive Hover with Icon
Each pill gets a small icon:
- Equity: TrendingUp
- F&O: Layers
- Commodity: CandlestickChart
- Currency: Globe
- Intraday: Zap
- Positional: Clock

On hover, the pill fills with its accent color at low opacity (`bg-[color]/10`).

### 3. Left Side -- Add a CTA Button
After the checklist items, add a subtle "Learn more" or "Start Journaling" button to give the section a clear call-to-action rather than just ending with bullet points.

### 4. Checklist Items -- Slightly Richer Style
- Wrap each item in a light inner-panel row (`bg-muted/5 rounded-lg px-3 py-2`) so they feel like card rows rather than plain text
- Add a subtle right-arrow on hover for interactivity

### 5. Background -- Subtle Dot Pattern
Add the existing `dot-pattern` class to the section background for visual texture, matching the premium feel of other sections.

## Technical Changes

### File: `src/pages/Landing.tsx` (lines 1259-1310)

**Right column (lines 1289-1307):**
- Wrap pills in a mock card container with header "Market Segments"
- Add icon to each pill object and render it
- Add market status strip below pills
- Add Indian tricolor decorative stripe at card top

**Left column (lines 1275-1287):**
- Wrap each checklist `<li>` in a `rounded-lg bg-muted/5 px-3 py-2.5` container
- Add a CTA button after the `<ul>`: "Start Journaling" linking to `/login?mode=signup`

**Section wrapper (line 1260):**
- Add `dot-pattern` class alongside `bg-muted/10`

**Pill data (lines 1290-1296):**
- Add `icon` property to each segment object (using existing imported icons)

### No new files or dependencies needed

