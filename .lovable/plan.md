

## Use Uploaded Logo & Favicon

The user uploaded two files:
1. `user-uploads://logo.png` — full TradeBook logo with icon + text
2. `user-uploads://favicon-32x32.png` — small favicon icon

### Changes

#### 1. Copy files into project
- Copy `user-uploads://logo.png` → `src/assets/logo.png` (for React component imports)
- Copy `user-uploads://favicon-32x32.png` → `public/favicon-32x32.png` (for HTML favicon)

#### 2. Update favicon in `index.html`
- Change `<link rel="icon" href="/favicon.ico">` to reference `/favicon-32x32.png`
- Update `<link rel="apple-touch-icon">` similarly

#### 3. Replace icon-based logos with the image across all components
Replace the current `<div className="w-8 h-8 rounded-xl bg-gradient-primary"><TrendingUp /></div> + <span>TradeBook</span>` pattern with `<img src={logo} alt="TradeBook" className="h-8" />` in:

- `src/components/layout/Sidebar.tsx` — both mobile header and desktop sidebar logo (2 spots)
- `src/pages/Landing.tsx` — navbar logo and footer logo (2 spots)
- `src/pages/Login.tsx` — desktop sidebar logo and mobile logo (2 spots)
- `src/pages/Docs.tsx` — navbar logo (1 spot)

Each spot replaces the icon div + text span with a single `<img>` tag importing from `@/assets/logo.png`.

### Files Modified
- `index.html`
- `src/components/layout/Sidebar.tsx`
- `src/pages/Landing.tsx`
- `src/pages/Login.tsx`
- `src/pages/Docs.tsx`

