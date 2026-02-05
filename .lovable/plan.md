
# Fix Plan: Wrong LTP + Hide Quantity Field

## Issues Identified

### Issue 1: Wrong Price (PFOCUS showing 1005.16 instead of 264)
**Root Cause**: PFOCUS is not in the `instrument_master` database (only 334 stocks currently). When the LTP fetch fails to find the `security_id`, it falls back to mock prices which default to 1000 with random variation.

**Current flow**:
1. User selects PFOCUS via Manual mode (no `security_id` available)
2. LTP fetch is called with just the symbol (no `security_id`)
3. Dhan API cannot be called without `security_id`
4. Fallback to mock: `basePrices["PFOCUS"] || 1000` (PFOCUS not in basePrices, so defaults to 1000)
5. User sees ~1005.16

### Issue 2: Quantity Field Not Needed
Research analysts share trade ideas, not exact quantities. The Quantity field should be hidden or removed from the UI.

---

## Solution

### Part A: Remove the Mock Price Fallback (Accuracy First)
When we cannot fetch a real price, we should NOT show a fake one. Instead:
- If Dhan API call fails or returns nothing: return `null` for that symbol
- Show a clear message: "Live price unavailable. Enter manually."
- Never pre-fill Entry Price with mock data

**Changes to `get-live-prices` edge function**:
1. Remove the `basePrices` mock fallback entirely
2. Return `null` or skip symbols that couldn't be fetched
3. Add a `source: "unavailable"` flag for symbols without real data

### Part B: Hide/Remove Quantity Field
Since research analysts don't share quantity:
- Remove the Quantity input from the Create Trade modal
- Default quantity to `1` in backend (for internal tracking)
- Keep the field in database for future use, just hide from UI

**Changes to `CreateTradeModal.tsx`**:
1. Remove the Quantity input field from the form
2. Keep `quantity: 1` as default in submission

---

## Technical Changes

### File 1: `supabase/functions/get-live-prices/index.ts`
```text
- Remove the entire `basePrices` object (lines 12-41)
- Remove the mock price fallback loop (lines 162-178)
- For symbols without real Dhan data, return `null` or skip
- Add flag to indicate when price is unavailable
```

### File 2: `src/components/trade/InstrumentPicker.tsx`
```text
- Update LTP display to show "Price unavailable" when null
- Don't auto-fill Entry Price if LTP is null
```

### File 3: `src/components/modals/CreateTradeModal.tsx`
```text
- Remove the Quantity input field (lines 299-307)
- Keep internal default quantity = 1
- Update grid layout from 2 columns to 1 for Entry Price section
```

---

## Result
After this fix:
- If PFOCUS (or any stock) cannot be fetched from Dhan: shows "Price unavailable. Enter manually."
- No fake prices will ever be displayed
- Quantity field is hidden from the research trade modal
- Trade creation still works - user enters price manually if needed
