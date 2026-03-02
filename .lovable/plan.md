

# Merge Trust Strip + Stats into One Compact Section

## What Changes
Combine the two separate sections (Trust Strip with NSE/BSE/MCX/Dhan/Telegram logos + "By the Numbers" stats) into a single, visually compact section that sits between the Hero and Features.

## Design

```text
+------------------------------------------------------------------+
|  TRUSTED BY 1,200+ TRADERS ACROSS INDIAN MARKETS                 |
|                                                                    |
|  [NSE]   [BSE]   [MCX]   [Dhan]   [Telegram]                     |
|                                                                    |
|  ---- thin gradient separator line ----                           |
|                                                                    |
|  5           50+         1200+        24/7                        |
|  SEGMENTS   METRICS     TRADES       CLOUD ACCESS                 |
+------------------------------------------------------------------+
```

- Single `section` with `py-16 border-y border-border/20`
- Top half: trust headline + logo row (same as now)
- A thin gradient accent line as divider (`h-px` with `bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.2)] to-transparent`)
- Bottom half: stats in a horizontal flex row with animated counters
- Stats get a subtle `text-[hsl(var(--tb-accent))]` accent on the number for visual punch
- The whole thing is ~40-50% less vertical space than the current two sections combined

## Technical Changes

### File: `src/pages/Landing.tsx`

**Remove the separate Stats section (lines 907-932)** and **merge its content into the Trust Strip section (lines 880-905)**:

1. Keep the trust strip section wrapper but expand it to include stats below
2. Add a gradient divider line between logos and stats
3. Move the stats flex row (with animated counter refs `s3`, `s4`, `s5`) below the divider
4. Add the "24/7 Cloud Access" static stat alongside the animated ones
5. Remove the now-empty Stats `MotionSection` block entirely
6. Reduce overall vertical padding from `py-12` + `py-24` to a single `py-16`

No new files, dependencies, or data changes needed. Just restructuring existing JSX.

