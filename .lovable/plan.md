

# Hybrid Chart Attachments: Link-Only for New + Keep Existing Uploads

## Overview
Stop all new image uploads. Replace the upload component with a link-input + image preview component. Existing uploaded images (stored in `trade-charts` and `study-attachments` buckets) continue to display via signed URLs -- no data loss, no breaking changes.

## Changes

### 1. Create new `ChartLinkInput` component
**New file: `src/components/ui/chart-link-input.tsx`**

A lightweight component that:
- Provides a URL input field with an "Add" button
- Validates URLs before adding
- Renders added links as preview cards:
  - **Image URLs** (ending in `.png`, `.jpg`, `.webp`, `.gif`, `.svg`) -- shows a clickable thumbnail preview
  - **Non-image URLs** (TradingView, etc.) -- shows a styled card with the domain name and an external link icon
- Each card has a remove button
- Props: `links: string[]`, `onLinksChange`, `maxLinks` (default 5), `placeholder`

### 2. Update `CreateStudyModal`
**File: `src/components/modals/CreateStudyModal.tsx`**

- Replace `ChartImageUpload` import with `ChartLinkInput`
- The `attachments` state already stores string URLs, so this is a drop-in swap
- Remove the `bucket` prop since no uploads happen
- The existing "Chart Link" input and "Link attachments" section remain as-is (or merge into the new component)

### 3. Update `TradeDetailModal` -- Chart Images display
**File: `src/components/modals/TradeDetailModal.tsx`**

- Rename section from "Chart Images" to "Chart Snapshots"
- Keep existing rendering logic for image URLs (these are old uploaded images stored in buckets -- they'll continue working via their existing public/signed URLs)
- Add handling for non-image URLs: render as styled link cards instead of broken `<img>` tags
- This ensures both old uploaded images and new link-based entries display correctly

### 4. Delete old upload components
- **Delete:** `src/components/ui/chart-image-upload.tsx` -- no longer needed
- **Delete:** `src/components/trade/ChartAnnotationModal.tsx` -- annotation only works with uploaded images

### 5. Clean up constants
**File: `src/lib/constants.ts`**
- Remove `MAX_CHART_IMAGES_PER_TRADE` and `MAX_CHART_IMAGE_SIZE_BYTES` (no longer relevant)

## What stays untouched
- **Storage buckets** (`trade-charts`, `study-attachments`) remain in the database -- existing images stay accessible
- **`trades.chart_images`** column stays -- old data renders normally
- **`trades.chart_link`** field stays -- works as before
- **Telegram notifications** that reference chart images will still work for old trades

## Technical Details

### Image URL detection
```text
function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);
}
```

### Component API
```text
<ChartLinkInput
  links={attachments}
  onLinksChange={setAttachments}
  maxLinks={5}
  placeholder="Paste chart or image URL..."
/>
```

### Files summary
- **New:** `src/components/ui/chart-link-input.tsx`
- **Modified:** `src/components/modals/CreateStudyModal.tsx`, `src/components/modals/TradeDetailModal.tsx`, `src/lib/constants.ts`
- **Deleted:** `src/components/ui/chart-image-upload.tsx`, `src/components/trade/ChartAnnotationModal.tsx`

