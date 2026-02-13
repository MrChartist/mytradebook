

# Fix: Infinite Re-render Loop on Trades Page

## Root Cause

The "Maximum update depth exceeded" crash is caused by a **known Radix UI bug** where `Select` components rendered inside a `Dialog` trigger an infinite loop through the internal ref composition system (`@radix-ui/react-compose-refs` + `@radix-ui/react-presence`). The stack trace confirms this -- `setRef` fires during render, calls `setState`, which re-renders, which fires `setRef` again.

The crash triggers when the **CreateTradeModal** opens (it contains 6 Radix Select components inside a Dialog), and can also be triggered by the **SortSelect** dropdown on the Trades page.

## Fix Strategy

Replace all Radix `Select` components that participate in the crash with lightweight native HTML `<select>` elements. This completely eliminates the Radix ref-composition loop while keeping identical functionality and consistent styling.

## Changes

### 1. `src/components/modals/CreateTradeModal.tsx`
Replace all 6 Radix Select usages with styled native `<select>` elements:
- **Segment** selector (line 346)
- **Trade Type** selector (line 366)
- **Timeframe** selector (line 468)
- **Trailing SL Method** selector (line 534)
- **Trailing SL Activation** selector (line 549)
- **Holding Period** selector (line 656)

Each gets a native `<select>` with Tailwind classes matching the existing input styling (`h-10 rounded-md border border-input bg-background px-3 text-sm`).

### 2. `src/components/ui/sort-select.tsx`
Replace the Radix Select with a native `<select>` element. Keeps the `ArrowUpDown` icon and compact styling.

### 3. No other files changed
- No database changes
- No hook changes
- No edge function changes
- The segment filter buttons on Trades page (already fixed) stay as-is

## Technical Details

Native `<select>` pattern used throughout:

```tsx
// Before (crashes):
<Select value={value} onValueChange={onChange}>
  <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">A</SelectItem>
  </SelectContent>
</Select>

// After (stable):
<select
  value={value}
  onChange={(e) => onChange(e.target.value)}
  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
>
  <option value="">Select...</option>
  <option value="a">A</option>
</select>
```

This approach:
- Eliminates the Radix compose-refs infinite loop entirely
- Works perfectly inside Dialog components
- Is lighter weight (no portal, no animation overhead)
- Renders instantly with no JS overhead

