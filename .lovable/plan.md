

# Apply New Color Palette Across the Entire Website

## Color Palette (from your image)

| Name | Hex | HSL (approx) | Role |
|------|-----|------|------|
| Amethyst | #9F62E6 | 269 70% 64% | Primary accent |
| Crimson | #E1384D | 352 74% 55% | Destructive / Loss |
| Pumpkin | #FF7633 | 20 100% 60% | Warning / Secondary accent |
| Peach Cream | #FFF1DE | 35 100% 93% | Light mode background |
| Woodsmoke | #0E0D0B | 40 15% 4% | Dark mode background |
| Main Gradient | Orange-red to Purple | -- | Gradient primary |

## What Changes

### 1. Light Theme (`:root` in `src/index.css`)
- **Background**: Peach Cream warm tone (`35 100% 93%`) instead of cool blue-grey
- **Card**: White stays, but secondary/muted shift to warm cream tones
- **Primary**: Amethyst purple (`269 70% 64%`) replaces the current blue-purple
- **Destructive / Loss**: Crimson (`352 74% 55%`)
- **Warning**: Pumpkin orange (`20 100% 60%`)
- **Profit**: Keep green (unchanged -- standard trading color)
- **Gradient Primary**: `linear-gradient(135deg, #FF7633, #E1384D, #9F62E6)` (the orange-to-red-to-purple from your image)
- **Borders/inputs**: Warm-tinted border colors
- **Ring/focus**: Amethyst purple

### 2. Dark Theme (`.dark` in `src/index.css`)
- **Background**: Woodsmoke-based (`40 15% 4%`) -- warm dark instead of cold blue-dark
- **Card**: Slightly lighter warm dark (`35 10% 8%`)
- **Primary**: Lighter Amethyst (`269 70% 72%`) for visibility on dark
- **Same gradient, shadows, and accent logic -- just darkened appropriately
- **Borders**: Warm dark tones instead of cool blue

### 3. Gradient & Shadow Tokens (in `src/index.css`)
- `--gradient-primary`: Updated to the orange-red-purple sweep from the palette image
- `--shadow-glow`: Updated to use Amethyst purple glow
- `--shadow-loss-glow`: Use Crimson

### 4. Sidebar accent colors (`src/index.css`)
- Sidebar variables updated to match the new warm palette (Amethyst primary, warm backgrounds)

## Files Modified

| File | Change |
|------|--------|
| `src/index.css` | Update all CSS custom properties in `:root` and `.dark` to new palette |

## What Stays the Same
- All component files, layouts, and pages remain untouched -- they reference CSS variables
- Profit green stays green (industry standard for trading)
- Border radius, typography, animations, shadows structure all preserved
- Tailwind config unchanged (it already references the CSS variables)

