

# Bring Dashboard Visual Language to the Docs Page

## Problem

The Docs page uses a flat, static design while the Dashboard uses a rich "Quantix" fintech aesthetic with premium cards, dot-pattern decorations, accent bars, inner panels, and entrance animations. Visitors going from Landing to Docs feel a visual downgrade.

## What Changes

Apply the dashboard's visual system to the Docs page content while keeping the docs layout and navigation intact. This covers:

1. **Entrance animations on content sections** (staggered fade-in)
2. **Premium card treatment for FeatureCards** (upgrade from basic Card to `premium-card-hover` with dot-pattern corners)
3. **Dashboard-style SectionHeader** (use `dashboard-card` wrapper with icon badges matching StatCard's `inner-panel` treatment)
4. **Animated KPI-like stats in the hero** (replace the static badge with a mini stats strip showing doc section count, feature count, etc.)
5. **Sidebar active state polish** (add the 3px accent bar animation from the dashboard sidebar)
6. **Bottom CTA section** (upgrade to match Landing's Final CTA with gradient background and glow button)
7. **Footer visual sync** (add `dot-pattern` to match Landing footer)

## Technical Changes

### File: `src/pages/Docs.tsx`

**1. Add staggered entrance animations to sections**

Wrap each `<section>` in a `motion.section` with staggered `fade-in` using `whileInView`:

```tsx
<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  transition={{ duration: 0.4 }}
>
```

This uses the `motion` import already present in the file.

**2. Upgrade FeatureCard component (lines 84-108)**

- Replace `Card` base with `premium-card-hover` classes from the dashboard design system
- Add a decorative dot-pattern corner (same as `StatCard`): `<div className="absolute top-0 right-0 w-20 h-20 dot-pattern opacity-30 rounded-bl-2xl" />`
- Add subtle scale-on-hover via `hover:scale-[1.005]` (already partially there at `1.003`, bump slightly)
- Upgrade the icon container to use `inner-panel` styling like dashboard cards

**3. Upgrade SectionHeader component (lines 111-127)**

- Wrap in a `dashboard-card` style container with the accent top-bar
- Change the icon badge to use the dashboard's `icon-badge` class with `inner-panel` background
- Add a subtle `motion.div` fade for the accent line

**4. Add hero stats strip below the subtitle (line 281)**

Add a mini row of 3-4 stats below the hero description, styled like compact KPI cards:

```text
[ 15 Sections ] [ 50+ Mockups ] [ Every Feature ] [ Free & Pro ]
```

Using `inner-panel` containers with small text, matching the dashboard's metric card aesthetic.

**5. Polish sidebar active state (lines 298-314)**

- Add `transition-all duration-200` to sidebar buttons
- Animate the active accent bar with `motion.div` layoutId for smooth sliding between items
- Add `hover:translate-x-0.5` micro-interaction on sidebar items

**6. Upgrade bottom CTA section (lines 1168-1183)**

- Add `bg-gradient-to-b from-[hsl(var(--tb-accent)/0.04)] to-transparent` background
- Use `shimmer-cta` class on the button (already defined in CSS)
- Add `motion.div` entrance animation

**7. Upgrade footer (lines 1188-1199)**

- Add `dot-pattern` class to match Landing footer treatment
- Change `bg-card/30` to `bg-card/50 dot-pattern`

### Summary

| Element | Before | After |
|---------|--------|-------|
| Feature cards | Basic `Card` with hover border | `premium-card-hover` + dot-pattern corner + inner-panel icon |
| Section headers | Static div with accent line | Dashboard-card wrapper + icon-badge + motion fade |
| Content sections | No animation | Staggered `whileInView` fade-in |
| Hero area | Badge + text only | Badge + text + mini stats strip |
| Sidebar active | Static highlight | Animated accent bar with `layoutId` |
| Bottom CTA | Plain border-t section | Gradient bg + shimmer button + motion entrance |
| Footer | `bg-card/30` | `bg-card/50 dot-pattern` |

No new files or dependencies. All classes (`premium-card-hover`, `dashboard-card`, `inner-panel`, `dot-pattern`, `icon-badge`, `shimmer-cta`) are already defined in `src/index.css`. `motion` is already imported.

