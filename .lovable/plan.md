

# Unify Landing Page Visual Structure

## Problem
The landing page has grown organically, resulting in inconsistent visual patterns across sections:
- **Backgrounds**: Some sections have `bg-muted/10`, some are transparent, `dot-pattern` is applied randomly
- **Padding**: Varies between `py-16`, `py-24 lg:py-32`, and `py-28 lg:py-36`
- **Separators**: Mix of `border-y`, gradient lines, and nothing between sections
- **Heading sizes**: Most use `text-4xl lg:text-6xl` but some use `text-3xl lg:text-5xl`

## Design System

Establish a consistent visual rhythm:

```text
Section A  (transparent)         -- Hero, Features, Comparison, Testimonials, Final CTA
Section B  (bg-muted/10)         -- Trust+Stats, How It Works, Pricing, Built for India, FAQ
```

- **All main sections**: `py-24 lg:py-32` (Final CTA gets `py-28 lg:py-36` as the one exception for emphasis)
- **Trust+Stats strip**: Bump from `py-16` to `py-20` for better breathing room, use `bg-muted/10`
- **dot-pattern**: Apply ONLY to `bg-muted/10` sections consistently (the shaded band gets texture, the clear band stays clean)
- **Separators**: Remove all `border-y` and replace with consistent gradient accent dividers between every section pair
- **Headings**: Standardize all section headings to `text-4xl lg:text-6xl` (fix "Built for Indian Markets" and "FAQ" which currently use `text-3xl lg:text-5xl`)

## Technical Changes

### File: `src/pages/Landing.tsx`

**1. Trust Strip + Stats section (line 881)**
- Change `py-16 border-y border-border/20` to `py-20 bg-muted/10 dot-pattern`
- Add gradient divider line after section close (before Features)

**2. Features section (line 931)**
- Keep as-is (transparent, no dot-pattern) -- already correct
- Add gradient divider after section

**3. How It Works section (line 995)**
- Change `bg-muted/10` to `bg-muted/10 dot-pattern` for consistency
- Already has correct padding

**4. Comparison section (line 1055)**
- Keep transparent -- already correct
- Add gradient divider after

**5. Pricing section (line 1121)**
- Already has `bg-muted/10 dot-pattern` -- correct

**6. Testimonials section (line 1227)**
- Remove `dot-pattern` (it's a transparent/clear section)
- Keep padding as-is

**7. Built for Indian Markets section (line 1433)**
- Already has `bg-muted/10 dot-pattern` -- correct
- Fix heading from `text-3xl lg:text-5xl` to `text-4xl lg:text-6xl`

**8. FAQ section (line 1521)**
- Remove standalone `dot-pattern`, change to `bg-muted/10 dot-pattern` (it's a shaded section but was missing the bg)
- Fix heading from `text-3xl lg:text-5xl` to `text-4xl lg:text-6xl`

**9. Add gradient dividers between sections**
- Insert a reusable gradient `<div>` (`h-px bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.15)] to-transparent max-w-2xl mx-auto`) between each major section boundary where there isn't already one

**10. Footer**
- Keep `bg-card/50 dot-pattern` as the distinct footer treatment

### Summary of background pattern:

| Section | Background | dot-pattern | Heading size |
|---------|-----------|-------------|--------------|
| Hero | transparent + gradients | No | (custom) |
| Trust+Stats | bg-muted/10 | Yes | (no heading) |
| Features | transparent | No | 4xl/6xl |
| How It Works | bg-muted/10 | Yes | 4xl/6xl |
| Comparison | transparent | No | 4xl/6xl |
| Pricing | bg-muted/10 | Yes | 4xl/6xl |
| Testimonials | transparent | No | 4xl/6xl |
| Built for India | bg-muted/10 | Yes | 4xl/6xl |
| FAQ | bg-muted/10 | Yes | 4xl/6xl |
| Final CTA | transparent | No | 4xl/6xl |
| Footer | bg-card/50 | Yes | -- |

No new files, dependencies, or data changes. Pure class name adjustments across ~12 lines.

