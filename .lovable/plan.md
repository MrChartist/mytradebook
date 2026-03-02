

# Docs Page Visual & Readability Overhaul

## Problem

The Docs sidebar is permanently visible at `w-64`, eating into content width. On a typical screen the reading column feels cramped. The overall visual treatment -- while improved with premium cards and animations -- still lacks the polished, spacious feel of the Dashboard. Key issues:

- **Sidebar cannot be collapsed** -- no way to reclaim reading space
- **Content column is narrow** due to fixed sidebar + max-w-7xl container
- **Feature cards feel dense** -- text-heavy with little breathing room
- **Section transitions are abrupt** -- no visual separators between the 15 major sections
- **Typography lacks reading rhythm** -- body text, headings, and mockups blend together without clear hierarchy spacing

---

## Changes

### 1. Collapsible Docs Sidebar

Add a collapse/expand toggle to the docs sidebar. When collapsed, the sidebar shrinks to a narrow icon-only strip (`w-14`), and the content expands to fill the freed space.

- Add a `sidebarCollapsed` state to `DocsContent`
- Collapsed mode: show only section icons (no labels, no group headers) in a `w-14` strip
- Expanded mode: current `w-64` with full labels
- Toggle button at the top of the sidebar (chevron icon, same pattern as the app sidebar)
- Persist preference in `localStorage` so it remembers across visits
- Smooth `transition-all duration-300` on the aside width
- On first visit, sidebar starts expanded

### 2. Wider Content Area

- Change `max-w-7xl` container to `max-w-[1400px]` for more breathing room
- Content `main` gets `max-w-4xl` when sidebar is expanded, and `max-w-5xl` when collapsed -- giving noticeably more reading width
- Feature card grids stay at `md:grid-cols-2` but cards get slightly more padding (`p-7` instead of `p-6`)

### 3. Section Dividers & Spacing

- Add a decorative divider between each major section: a thin gradient line with a centered dot (using the accent color)
- Increase `space-y-20` to `space-y-24` for more breathing room between sections
- Add `mb-6` to `SectionHeader` descriptions for more gap before the first card

### 4. Improved Typography & Reading Flow

- Increase FeatureCard body text from `text-sm` to `text-[14px] leading-relaxed` for better readability
- Add `prose`-like max-width (`max-w-prose`) to description paragraphs inside cards so long lines don't stretch across the full card width
- Section header titles: bump from `text-2xl lg:text-3xl` to `text-2xl lg:text-[2rem]` with tighter `leading-tight`

### 5. Enhanced Card Visual Depth

- Add a subtle `bg-gradient-to-br from-card to-card/80` to FeatureCards for depth
- FeatureCard icon container: add a soft `shadow-sm` to the inner-panel for more pop
- Mockup containers inside cards: wrap in a subtle `rounded-xl border border-border/30 bg-muted/20 p-3` frame to visually separate mockups from text content

### 6. Sidebar Visual Polish

- Add a mini "Table of Contents" header with a collapse button in the sidebar top area
- Show a progress indicator (thin accent-colored bar at the top of sidebar) showing how far through the docs the user has scrolled
- Collapsed sidebar: show tooltip on hover over each icon with the section name

---

## Technical Details

### File: `src/pages/Docs.tsx`

**State & localStorage:**
```tsx
const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  return localStorage.getItem("docs-sidebar-collapsed") === "true";
});

const toggleSidebar = () => {
  setSidebarCollapsed(prev => {
    localStorage.setItem("docs-sidebar-collapsed", String(!prev));
    return !prev;
  });
};
```

**Sidebar markup changes:**
- `aside` width: `sidebarCollapsed ? "w-14" : "w-64"` with `transition-all duration-300`
- Collapse button at top: chevron that rotates 180deg when collapsed
- When collapsed: render only `<s.icon />` centered in each row, wrapped in a `Tooltip` showing the label
- When expanded: current full rendering with group labels

**Content area:**
- Container: `max-w-[1400px]` (up from `max-w-7xl`)
- Main: conditionally apply `max-w-5xl` when sidebar collapsed, `max-w-4xl` when expanded
- Section spacing: `space-y-24`

**Section dividers:**
Between each `motion.section`, insert:
```tsx
<div className="flex items-center gap-4 py-2">
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
</div>
```

**FeatureCard updates:**
- Padding: `p-6` to `p-7`
- Body text size: `text-[14px] leading-relaxed`
- Mockup wrapper: `<div className="mt-4 rounded-xl border border-border/30 bg-muted/20 p-3">...</div>`

**Scroll progress bar:**
Add a `scrollProgress` state driven by a scroll listener, rendered as a thin bar at the top of the sidebar:
```tsx
<div className="h-0.5 bg-muted rounded-full overflow-hidden">
  <div className="h-full bg-primary transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
</div>
```

### Summary

| Change | Impact |
|--------|--------|
| Collapsible sidebar | Reclaims ~250px of reading width |
| Wider container | More spacious layout overall |
| Section dividers | Clear visual separation between topics |
| Better typography | Improved readability for long-form content |
| Card depth + mockup framing | Cleaner visual hierarchy |
| Scroll progress bar | Reader orientation within the page |

Single file change: `src/pages/Docs.tsx`. No new dependencies.

