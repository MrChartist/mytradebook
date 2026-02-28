

# Fix All Pending Issues

## Issues Identified

### 1. F&O Underlyings Hook Still Uses Direct Query (Not RPC)
The `useFnoUnderlyings` hook (line 10-16) still queries `instrument_master` table directly, hitting the 1000-row limit. The RPC function `get_fno_underlyings()` was created in the database but the hook was never updated to use it.

**Fix**: Replace the direct table query with `supabase.rpc("get_fno_underlyings")` which returns all 250 distinct symbols server-side.

### 2. Strategy Builder Not Integrated into Create Trade Modal
The plan included adding a "Build Multi-Leg Strategy" button in the Create Trade modal when "Options" segment is selected. This was never implemented.

**Fix**: Add a state + button in `CreateTradeModal.tsx` that opens the `MultiLegStrategyModal` when the Options segment is chosen.

### 3. Sidebar & Navigation Already Working
Watchlist is correctly added to both `Sidebar.tsx` and `MobileDrawer.tsx` with the Eye icon. No fix needed.

### 4. Calendar Page Already Working
The Calendar page correctly uses `JournalCalendarView` with trade data mapped from closed trades. No fix needed.

### 5. Mistakes Page Already Working
The Mistakes page fetches `trade_mistakes` and `mistake_tags` correctly, shows repeat patterns and monthly trends. No fix needed.

### 6. Reports Download Already Working
The `handleDownloadPdf` function generates and downloads a text file. No fix needed.

---

## Changes Required

### File 1: `src/hooks/useFnoUnderlyings.ts`
- Replace `supabase.from("instrument_master").select(...)` with `supabase.rpc("get_fno_underlyings")`
- Parse the RPC result (returns `{ underlying_symbol: string }[]`) into the indices/stocks split
- Remove the manual deduplication logic since RPC already returns distinct values

### File 2: `src/components/modals/CreateTradeModal.tsx`
- Import `MultiLegStrategyModal` component
- Add a `showStrategyBuilder` state variable
- When `segment === "Options"`, show a "Build Multi-Leg Strategy" button with a Layers icon
- Render `MultiLegStrategyModal` conditionally, closing both modals on strategy creation

---

## Technical Details

**Hook fix** (useFnoUnderlyings.ts):
```typescript
const { data, error } = await supabase.rpc("get_fno_underlyings");
// Returns: { underlying_symbol: string }[]
const symbols = (data || []).map(r => r.underlying_symbol);
```

**CreateTradeModal integration**:
- Button appears below the segment selector when Options is chosen
- Opens the strategy builder in a separate dialog
- Both modals close when strategy is successfully created

