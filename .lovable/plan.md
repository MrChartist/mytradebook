

# Fix Readability — Increase Font Sizes Across Website

## Problem
The typography scale is set too small. The base body font is `0.875rem` (14px), and many components use even smaller values like `10px`, `11px`, `12px`, `12.5px`, `13px` which are hard to read. The docs page components (`ProTip`, `StepByStep`, `ExpandableDetail`, `SubTopic`, `ComparisonTable`, `KeyMetric`) and the docs layout (sidebar, section headers, content paragraphs) all use undersized text.

## Plan

### 1. Bump global base font size (`src/index.css`)

Update the semantic typography scale:
- `body` base: `0.875rem` (14px) → `1rem` (16px)
- `.text-2xs`: `0.625rem` → `0.6875rem` (11px) — micro labels
- `.text-caption`: `0.6875rem` → `0.75rem` (12px)
- `.text-body-sm`: `0.8125rem` → `0.875rem` (14px)
- `.text-body`: `0.875rem` → `1rem` (16px)
- `.text-heading-sm`: `1rem` → `1.125rem` (18px)
- `.text-heading`: `1.25rem` → `1.375rem` (22px)
- `.text-heading-lg`: `1.5rem` → `1.75rem` (28px)
- `.text-display`: `1.875rem` → `2.25rem` (36px)
- `.text-display-serif`: `1.875rem` → `2.25rem`
- `.kpi-label`: keep uppercase but use `0.75rem`
- `.sidebar-section-label`: `10px` → `11px`

### 2. Docs Enhancement Components (`src/components/docs/DocsEnhancements.tsx`)

Bump all hardcoded pixel sizes:
- **ProTip**: label `10px` → `11px`, body `13px` → `15px`
- **StepByStep**: step number `10px` → `12px`, title `13px` → `15px`, description `12.5px` → `14px`, detail `11px` → `13px`
- **ComparisonTable**: table text `12px` → `14px`, title `12px` → `14px`
- **ExpandableDetail**: title `13px` → `15px`, badge `9px` → `10px`, inner content `13px` → `15px`
- **InteractiveMockup**: label `9px` → `10px`
- **KeyMetric**: label `10px` → `12px`, sub `10px` → `12px`
- **SubTopic**: h3 `15px` → `17px`, description `13px` → `15px`

### 3. Docs Page (`src/pages/Docs.tsx`)

Bump hardcoded sizes in:
- **Header**: title already `text-2xl` (fine after base bump), subtitle `14px` → `15px`, meta `11px` → `12px`
- **Left sidebar**: group labels `9px` → `10px`, nav items `12px` → `13px`, search input `11px` → `12px`, "Contents" label `10px` → `11px`
- **Right sidebar** ("On this page"): heading `10px` → `11px`, links `11px` → `12px`
- **Mobile tabs**: `11px` → `12px`
- **SectionHeader**: title keep `text-xl`, description `13.5px` → `15px`
- **FeatureCard**: title `text-sm` → `text-[15px]`, badge `9px` → `10px`, inner paragraphs `13px` → `15px`
- **VideoPlaceholder**: title `13px` → `15px`, subtitle `11px` → `12px`
- **Content paragraphs**: any `text-[13px]` → `text-[15px]`, `text-sm` for body → `text-[15px]`

### 4. Page Header (`src/components/ui/page-header.tsx`)

- Subtitle `13px` → `15px`

### 5. Landing Page Components (light touch)

- **BelowFoldSections.tsx**: any body `text-sm` (14px) is now fine with base bump; check for `text-[13px]` patterns and bump to `text-[15px]`
- **HeroSection.tsx**: subtitle sizing — verify adequate after base bump
- **LandingShared.tsx**: `SectionBadge` — `10px` → `11px`

**No changes** to routes, anchors, functionality, logic, or backend.

