

## Add Option Chain Selector to Instrument Picker

### Problem
When searching for options in the NFO exchange, too many contracts appear (multiple strikes, expiries for each underlying), making it hard to find the right one.

### Solution
Add an "Option Chain" mode to the `InstrumentPicker` that appears when segment is "Options". This uses the existing `OptionChainSelector` component which provides a guided step-by-step flow: **Underlying → Expiry → Strike → CE/PE**.

### Changes

#### `src/components/trade/InstrumentPicker.tsx`
- Add a third mode: `"search" | "chain" | "manual"` (instead of just search/manual)
- When `segment === "Options"`, default to `"chain"` mode and show a 3-way toggle (Search / Option Chain / Manual)
- In `"chain"` mode, render the existing `OptionChainSelector` component
- Map the `OptionChainSelector`'s output (`symbol`, `ltp`, `contractKey`) to the `SelectedInstrument` interface so `onSelect` works seamlessly

#### `src/components/trade/OptionChainSelector.tsx`
- Minor adjustment: ensure the `onSelect` callback provides `exchange` and `instrument_type` fields so the parent can construct a proper `SelectedInstrument`

### Flow
1. User selects "Options" segment in Create Trade modal
2. InstrumentPicker defaults to "Option Chain" mode
3. User picks underlying (NIFTY, BANKNIFTY, etc.) → expiry → strike → CE/PE
4. On confirm, the contract is set as the selected instrument with symbol like `BANKNIFTY 05MAR26 48000CE`
5. User can still switch to Search or Manual mode if preferred

### Files
- `src/components/trade/InstrumentPicker.tsx`
- `src/components/trade/OptionChainSelector.tsx`

