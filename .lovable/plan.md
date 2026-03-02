

# Polish Footer to Match Header Style

## Current State
The footer has the right structure (4-column grid with logo, Product, Support, Legal links + bottom bar) but it feels flat and disconnected from the premium "floating island" navbar style. It lacks visual refinement like the header's backdrop-blur, rounded borders, and spacing.

## Improvements

### 1. Logo Treatment -- Match Navbar Exactly
The navbar logo uses a `rounded-xl` icon with a glow shadow (`shadow-[0_0_16px_hsl(var(--tb-accent)/0.25)]`) and `font-logo` text. The footer logo uses `rounded-lg` without glow. Sync them.

### 2. Footer Link Hover -- Pill Style Like Navbar
Navbar links have `rounded-full hover:bg-muted/60` pill hover states. Footer links are plain `hover:text-foreground`. Add the same pill hover style with slight padding for consistency.

### 3. Add Social/Action Row
Add a small row in the logo column with:
- A "Get Started" pill button (matching the navbar CTA style)
- A ThemeToggle (matching the navbar)

### 4. Column Headers -- Badge Style
Replace plain `<h4>` column headers with the same `SectionBadge`-like uppercase tracking style used elsewhere, but smaller -- `text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground/60` to match the `sidebar-section-label` pattern.

### 5. Bottom Bar -- Richer Layout
- Add a thin decorative accent gradient line above the bottom bar (same as the CTA section separator)
- Add the Indian tricolor micro-stripe before "Made with" text
- Style the SEBI disclaimer with a subtle `bg-muted/30 rounded-full px-3 py-1` pill treatment

### 6. Background -- Match Premium Feel
Change from `bg-card/30` to a slightly richer treatment with the `dot-pattern` class for texture consistency with other sections.

### 7. Add Extra Links
- Add "Changelog" under Product
- Add "FAQ" under Support (scrolls to FAQ section)

## Technical Changes

### File: `src/pages/Landing.tsx` (lines 1512-1555)

**Section background (line 1513):**
- Change to `border-t border-border/30 bg-card/50 dot-pattern py-16`

**Logo block (lines 1517-1525):**
- Match navbar icon: `rounded-xl` + glow shadow
- Add a mini CTA row: "Get Started" pill button + ThemeToggle

**Column headers (lines 1528, 1536, 1543):**
- Change to `text-[11px] uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5`

**Links (lines 1530-1532, 1538-1539, 1545-1546):**
- Add `rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50` for pill hover effect
- Add "Changelog" and "FAQ" links

**Bottom bar (lines 1550-1553):**
- Add gradient separator line above
- Wrap SEBI disclaimer in a subtle pill
- Style "Made with" section with the tricolor micro-stripe (3 small colored dots or bars)

### No new files or dependencies needed

