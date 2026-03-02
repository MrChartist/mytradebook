

# Hero Section Floating Elements Enhancement

## Current State
The hero has 6 floating elements: a RELIANCE trade card (top-left), an alert badge (top-right), an MTD P&L badge (mid-left), and 4 scattered icon badges. The right side and bottom areas feel empty, and the elements don't fully convey the product's breadth.

## Changes to `FloatingElements` in `src/pages/Landing.tsx`

### New Floating Tags (5 additions)

1. **Win Rate Badge (bottom-right)** -- A small glassmorphic card showing "Win Rate 68%" with a green progress arc, floating with a gentle bob animation. Conveys analytics at a glance.

2. **Streak Badge (mid-right)** -- "5-Day Win Streak" with a fire/trophy icon and a warm glow. Reinforces the discipline/gamification angle.

3. **AI Insight Chip (bottom-left)** -- A compact tag reading "AI: Reduce position size on Mondays" with a Brain icon and purple accent. Highlights the AI feature.

4. **Trade Count Ticker (top-center-left area)** -- A tiny pill showing "47 Trades This Week" with an Activity icon. Shows active usage.

5. **Risk-Reward Tag (top-center-right area)** -- A small badge showing "R:R 1:2.4" with a Target icon. Speaks to serious traders.

### Improvements to Existing Elements

- Stagger animation delays more evenly so elements don't all bob in sync
- Add subtle `shadow-[0_8px_32px_rgba(0,0,0,0.08)]` to all cards for more depth
- Make existing icon scatters slightly larger and more visible (opacity bump from 0.3-0.55 to 0.35-0.6)

### Visual Balance
- New elements are distributed to fill the empty zones: bottom-right, mid-right, bottom-left, and the upper mid-zones
- All use the existing glassmorphic style: `rounded-2xl border border-border/30 bg-card/80 backdrop-blur-md`
- Each has a unique bob timing (5-8s) and delay to create organic, non-synchronized floating

## Technical Details

### File: `src/pages/Landing.tsx` -- `FloatingElements` component (lines 178-246)

Add 5 new `motion.div` blocks after the existing floating elements, before the icon scatter array:

```tsx
{/* Win Rate badge - bottom right */}
<motion.div
  className="absolute bottom-[28%] right-[5%] hidden lg:block"
  animate={{ y: [0, -10, 0], rotate: [1, -1, 1] }}
  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
>
  <div className="rounded-2xl border border-profit/15 bg-card/80 backdrop-blur-md px-4 py-2.5 shadow-lg">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-profit/10 flex items-center justify-center">
        <PieChart className="w-3.5 h-3.5 text-profit" />
      </div>
      <div>
        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Win Rate</p>
        <p className="text-sm font-bold font-mono text-profit">68.4%</p>
      </div>
    </div>
  </div>
</motion.div>

{/* Streak badge - mid right */}
<motion.div
  className="absolute top-[52%] right-[6%] hidden xl:block"
  animate={{ y: [0, -8, 0] }}
  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
>
  <div className="rounded-2xl border border-[hsl(var(--tb-accent)/0.2)] bg-card/80 backdrop-blur-md px-3.5 py-2 shadow-lg flex items-center gap-2">
    <Trophy className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
    <div>
      <p className="text-[10px] font-semibold">5-Day Streak</p>
      <p className="text-[8px] text-muted-foreground">All targets hit</p>
    </div>
  </div>
</motion.div>

{/* AI Insight chip - bottom left */}
<motion.div
  className="absolute bottom-[22%] left-[5%] hidden xl:block"
  animate={{ y: [0, -9, 0], rotate: [0, 1, 0] }}
  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
>
  <div className="rounded-2xl border border-[hsl(270_60%_55%/0.15)] bg-card/80 backdrop-blur-md px-3.5 py-2.5 shadow-lg flex items-center gap-2.5 max-w-[200px]">
    <div className="w-7 h-7 rounded-lg bg-[hsl(270_60%_55%/0.1)] flex items-center justify-center shrink-0">
      <Brain className="w-3.5 h-3.5 text-[hsl(270_60%_55%)]" />
    </div>
    <p className="text-[9px] text-muted-foreground leading-tight">
      <span className="font-semibold text-foreground/80">AI:</span> Reduce size on Mondays
    </p>
  </div>
</motion.div>

{/* Trade count pill - upper area */}
<motion.div
  className="absolute top-24 left-[22%] hidden xl:block"
  animate={{ y: [0, -6, 0] }}
  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
>
  <div className="rounded-full border border-border/30 bg-card/70 backdrop-blur-md px-3 py-1.5 shadow-sm flex items-center gap-1.5">
    <Activity className="w-3 h-3 text-muted-foreground/50" />
    <span className="text-[9px] font-medium text-muted-foreground">47 trades this week</span>
  </div>
</motion.div>

{/* Risk-Reward tag - upper right area */}
<motion.div
  className="absolute top-28 right-[20%] hidden xl:block"
  animate={{ y: [0, -7, 0] }}
  transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
>
  <div className="rounded-full border border-border/30 bg-card/70 backdrop-blur-md px-3 py-1.5 shadow-sm flex items-center gap-1.5">
    <Target className="w-3 h-3 text-[hsl(var(--tb-accent)/0.6)]" />
    <span className="text-[9px] font-mono font-semibold text-muted-foreground">R:R 1:2.4</span>
  </div>
</motion.div>
```

Update existing icon scatter opacity from `[0.3, 0.55, 0.3]` to `[0.35, 0.6, 0.35]` for better visibility.

### Summary

| Element | Position | Purpose |
|---------|----------|---------|
| Win Rate 68.4% | Bottom-right | Showcases analytics |
| 5-Day Streak | Mid-right | Highlights gamification |
| AI Insight | Bottom-left | Promotes AI features |
| 47 Trades | Upper-left area | Shows active usage |
| R:R 1:2.4 | Upper-right area | Appeals to serious traders |

Single file change: `src/pages/Landing.tsx`. No new dependencies.

