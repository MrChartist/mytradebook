
# Fix: Sidebar Collapse Leaves Empty Space

## Problem
The sidebar collapsed state is stored locally inside `Sidebar.tsx` using `useState(false)`. Meanwhile, `MainLayout.tsx` hardcodes the main content margin as `lg:ml-[230px]` -- it never changes when the sidebar collapses to 68px, leaving a gap.

## Solution
Lift the `collapsed` state out of Sidebar so MainLayout can read it and adjust the margin accordingly.

### 1. Create a Sidebar Context (`src/contexts/SidebarContext.tsx`)
- A small React context providing `collapsed` (boolean) and `setCollapsed` (setter)
- Default to `false` (expanded)

### 2. Update `Sidebar.tsx`
- Remove the local `useState(false)` for collapsed
- Import and use `useSidebarContext()` instead
- Everything else stays the same

### 3. Update `MainLayout.tsx`
- Wrap children with `SidebarProvider`
- Read `collapsed` from context
- Change the main element's class from hardcoded `lg:ml-[230px]` to dynamic: `lg:ml-[230px]` when expanded, `lg:ml-[68px]` when collapsed
- Keep the existing `transition-[margin] duration-300` for smooth animation

### Files
- **New:** `src/contexts/SidebarContext.tsx` (small context + provider, ~15 lines)
- **Modified:** `src/components/layout/Sidebar.tsx` (swap local state for context)
- **Modified:** `src/components/layout/MainLayout.tsx` (wrap with provider, dynamic margin)
