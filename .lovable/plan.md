

## Problem

The Achievements widget is a flat grid of tiny emoji squares with category headers — it reads as filler content rather than a meaningful, motivating dashboard element. The issues:

1. **No progress indication** on locked achievements (just greyed out, no "you're 7/10 trades toward this")
2. **Too many small items** in a dense grid — visually noisy, not scannable
3. **No hierarchy** — recently unlocked or "almost there" achievements don't stand out
4. **No emotional payoff** — unlocked badges look barely different from locked ones
5. **Takes up vertical space** without delivering insight

## Redesign Approach

Transform it from a "badge dump" into a **compact, motivating progress widget** with three distinct sections:

### Layout (single `premium-card`)

```text
┌─────────────────────────────────────────────────┐
│ 🏆 Achievements              3/14 unlocked      │
│ ████████░░░░░░░░░░░░  21%                       │
│                                                   │
│ ✨ RECENTLY UNLOCKED (horizontal scroll)         │
│ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │ 🎯   │ │ 🔥   │ │ 💰   │   ← glowing cards   │
│ │First │ │Streak│ │First │                       │
│ │Trade │ │  3   │ │Profit│                       │
│ └──────┘ └──────┘ └──────┘                       │
│                                                   │
│ 🔓 NEXT UP (1-2 closest to unlock)              │
│ ┌────────────────────────────────────┐           │
│ │ 🎯 10 Trades    ███████░░░  7/10  │           │
│ │ 🔥 Win Streak 5 ████░░░░░  4/5   │           │
│ └────────────────────────────────────┘           │
│                                                   │
│ View all 14 achievements              ▸          │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **"Recently Unlocked" row** — Show last 3 unlocked achievements as highlighted cards with a subtle glow/shine animation. If none unlocked yet, skip this section.

2. **"Next Up" section** — Calculate progress toward locked achievements and show the 2 closest to completion with mini progress bars and `4/5` labels. This is the motivating hook.

3. **Collapsed by default** — The full badge grid moves into an expandable accordion or a small dialog ("View all"). This keeps the dashboard widget compact (~200px tall) instead of the current sprawling grid.

4. **Unlocked cards get premium treatment** — `card-glow-profit` border glow, slightly larger emoji, subtle `liquid-shine` animation on recent unlocks.

5. **Progress math** — The hook already tracks `progress` per achievement and `threshold` exists on the definition. We compute `progress / threshold` percentage for the "Next Up" bars.

### Technical Changes

**`src/components/dashboard/AchievementsBadgeGrid.tsx`** — Full rewrite:
- Replace category-grouped grid with the 3-section layout above
- "Recently Unlocked": filter `unlocked === true`, sort by `unlocked_at` desc, take 3, render as horizontal scroll cards with glow
- "Next Up": filter `unlocked === false`, compute `progress / threshold`, sort descending, take 2, render with progress bars
- "View All": collapsible section or small dialog showing the full grid (keep existing grid code here)
- Use `premium-card` wrapper, consistent with other dashboard widgets

**`src/hooks/useAchievements.ts`** — Minor enhancement:
- Add `progressPercent` to enriched achievements: `Math.min((userProgress?.progress ?? computedProgress) / threshold * 100, 100)`
- Compute current progress for locked achievements too (so "Next Up" can show `7/10 trades`)
- Return `recentUnlocks` (last 3 by date) and `nextUp` (top 2 by progress%) as pre-computed arrays

No database changes needed. No new dependencies.

