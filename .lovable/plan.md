
# Improve Landing Page Readability

## Problems Identified

After reviewing the landing page in light mode, the key readability issues are:

1. **Body text too faint**: Description paragraphs throughout use `text-muted-foreground/80` which is very light gray on white -- hard to read
2. **Font sizes too small**: Many descriptions use `text-sm` (14px) and even `text-xs` (12px) where `text-base` (16px) would be more comfortable
3. **Section subtitles washed out**: Under every section heading, the subtitle text uses `/80` or `/70` opacity -- barely visible in light mode
4. **Stats labels nearly invisible**: "By the Numbers" labels use `text-[11px] text-muted-foreground/60` -- extremely faint and tiny
5. **Feature card descriptions too small**: `text-sm text-muted-foreground/80` is hard to scan
6. **Trust strip text too faint**: `text-muted-foreground/40` for exchange names is barely visible
7. **Comparison table text**: `text-sm` for feature names could be larger
8. **Pricing plan descriptions**: Use `text-muted-foreground/70` -- too light
9. **Testimonial body text**: Smaller testimonials use `text-sm text-muted-foreground/80`
10. **Footer text extremely faint**: Links use `/70`, tagline uses `/70`, legal text uses `/60`
11. **CTA section subtitle**: `text-muted-foreground/80` is too washed out
12. **SectionBadge component**: Uses `text-[10px]` and `text-muted-foreground/70` -- tiny and faint

## Changes (all in `src/pages/Landing.tsx`)

### A. SectionBadge Component (line 87)
- Increase font: `text-[10px]` to `text-xs`
- Improve contrast: `text-muted-foreground/70` to `text-muted-foreground`

### B. Trust Strip (lines 673-674)
- Exchange name opacity: `text-muted-foreground/40` to `text-muted-foreground/70`
- Trust label: `text-[11px] text-muted-foreground/60` to `text-xs text-muted-foreground`

### C. Stats Section Labels (line 713, 718)
- `text-[11px] text-muted-foreground/60` to `text-xs text-muted-foreground`

### D. Features Section (lines 736, 765)
- Section subtitle: `text-muted-foreground/80` to `text-muted-foreground`
- Card descriptions: `text-sm text-muted-foreground/80` to `text-base text-muted-foreground`
- Card titles: `text-lg` to `text-xl` for better hierarchy

### E. How It Works Section (lines 791, 814)
- Subtitle: `text-muted-foreground/80` to `text-muted-foreground`
- Step descriptions: `text-sm text-muted-foreground/80` to `text-base text-muted-foreground`
- Step titles: `text-lg` to `text-xl`

### F. Comparison Section (lines 834, 839-853)
- Subtitle: `text-muted-foreground/80` to `text-muted-foreground`
- Feature text: `text-sm` to `text-base`

### G. Pricing Section (lines 888, 923, 926)
- Subtitle: `text-muted-foreground/80` to `text-muted-foreground`
- Plan description: `text-sm text-muted-foreground/70` to `text-sm text-muted-foreground`
- Feature list items: keep `text-sm` but ensure good contrast

### H. Testimonials Section (lines 963, 1001)
- Subtitle: `text-muted-foreground/80` to `text-muted-foreground`
- Quote text in small cards: `text-sm text-muted-foreground/80` to `text-sm text-muted-foreground`

### I. Final CTA Section (lines 1040, 1052-1053)
- Subtitle: `text-lg text-muted-foreground/80` to `text-lg text-muted-foreground`
- Bottom trust text: `text-muted-foreground/60` to `text-muted-foreground`

### J. Footer (lines 1071-1073, 1080-1100)
- Tagline: `text-muted-foreground/70` to `text-muted-foreground`
- Links: `text-muted-foreground/70` to `text-muted-foreground`
- Legal: `text-muted-foreground/60` to `text-muted-foreground/80`

### K. Hero Section Micro-trust (line 502)
- `text-muted-foreground/70` to `text-muted-foreground`

## Summary of the Pattern
The core fix is simple and consistent across the entire page:
- Remove excessive `/80`, `/70`, `/60`, `/40` opacity modifiers from `text-muted-foreground` -- just use `text-muted-foreground` directly (it already has a properly designed muted color)
- Bump small text from `text-sm` (14px) to `text-base` (16px) for body/description paragraphs
- Bump tiny labels from `text-[10px]`/`text-[11px]` to `text-xs` (12px)

## Files Modified
- **`src/pages/Landing.tsx`** -- All readability improvements across every section below the hero
