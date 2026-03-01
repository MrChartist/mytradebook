

# Enhance Studies with Tag-Based Filtering

## Problem
Studies currently only filter by 5 broad categories (Technical, Fundamental, News, Sentiment, Other). Traders need to filter by the actual setup/pattern tags they use -- Classic Patterns, Candlestick Patterns, Setup Context -- which are currently only applied as tags but not filterable on the Studies page.

## Solution
Add a tag-based filter section to the Studies page that lets you filter studies by any tag (Classic Patterns, Candlesticks, Setup tags, and custom user tags). Keep the existing category filter as-is but make tags the primary way to drill down.

## Changes

### 1. Studies Page -- Add Tag Filter Bar (`src/pages/Studies.tsx`)
- Add a new collapsible "Filter by Tags" section below the existing category buttons
- Show tag chips grouped by type: Classic Patterns, Candlestick, Setup, Custom
- Clicking a tag chip filters the studies list to only show studies that have that tag
- Multiple tags can be selected (OR logic -- show studies matching any selected tag)
- Show a count badge next to each tag showing how many studies use it
- Clear all button to reset tag filters

### 2. Fetch Available Tags (`src/pages/Studies.tsx`)
- Use the existing `useAvailableTags()` hook to pull system + custom pattern, candlestick, and volume tags from the database
- Merge with the hardcoded tag arrays already in `CreateStudyModal.tsx` (patternTags, candlestickTags, setupTags) to build the complete filter list
- Only show tags that actually appear in at least one study (to avoid clutter)

### 3. Update Filtering Logic (`src/pages/Studies.tsx`)
- Add `selectedTags: string[]` state
- In the `filteredStudies` memo, add a filter step: if any tags are selected, only include studies where `study.tags` contains at least one of the selected tags
- This works client-side since studies are already fetched with their tags array

## Technical Details

### File: `src/pages/Studies.tsx`
- Add `selectedTags` state (string array)
- Import `useAvailableTags` hook
- Add a tag filter section after the category filter buttons, grouped under collapsible headers (Classic Patterns, Candlestick, Setup)
- Compute `tagCounts` from studies to show how many studies use each tag
- Update `filteredStudies` memo to include tag filtering:
  ```text
  if selectedTags.length > 0:
    list = list.filter(study => study.tags?.some(t => selectedTags.includes(t)))
  ```

### File: `src/lib/schemas.ts`
- No changes needed -- the category enum stays the same
- Tags are already stored as a text array in the studies table

### No database changes needed
- Studies already store tags as a `text[]` column
- The tag values are already being saved when creating studies
- This is purely a frontend filtering enhancement
