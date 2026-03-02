
# Apply Surgena-Style Typography to TradeBook Logo

## What is Surgena?
Surgena is a modern geometric sans-serif font with clean lines, balanced proportions, and a premium tech feel. Since it's a commercial font (not on Google Fonts), we'll use **Space Grotesk** -- a free Google Font with the same geometric, modern, tech-forward aesthetic that closely matches Surgena's character.

## Why Space Grotesk?
- Same geometric sans-serif family as Surgena
- Clean, modern, slightly condensed proportions
- Works beautifully for logos and headings
- Available free on Google Fonts
- Matches the warm orange theme perfectly when combined with letter-spacing and weight

## Changes

### 1. Add Space Grotesk font (`index.html`)
- Add "Space Grotesk" to the existing Google Fonts link (weight 700 for bold logo usage)

### 2. Create a reusable logo text class (`src/index.css`)
- Add a `.logo-text` utility class with `font-family: 'Space Grotesk'`, `font-weight: 700`, and tight letter-spacing to nail the Surgena look

### 3. Update all "TradeBook" logo instances
Apply the new logo font class in these locations:
- **Sidebar mobile header** (`src/components/layout/Sidebar.tsx`, line 92)
- **Sidebar desktop** (`src/components/layout/Sidebar.tsx`, line 121)
- **Landing page navbar** (`src/pages/Landing.tsx`, line 389)
- **Docs page navbar** (`src/pages/Docs.tsx`, line 209)
- **Landing page footer** (if logo text appears there)

### 4. Tailwind config (`tailwind.config.ts`)
- Add `logo: ["Space Grotesk", "Inter", "system-ui", "sans-serif"]` to `fontFamily` so we can use `font-logo` class

## Files Modified
- `index.html` -- add font import
- `tailwind.config.ts` -- add `logo` font family
- `src/components/layout/Sidebar.tsx` -- apply `font-logo` to logo text
- `src/pages/Landing.tsx` -- apply `font-logo` to navbar logo
- `src/pages/Docs.tsx` -- apply `font-logo` to navbar logo

No functional changes -- purely typographic styling for the brand logo.
