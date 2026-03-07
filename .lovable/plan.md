

## Improve Instrument Selection UX Across Trades, Alerts & Studies

### Current Pain Points
1. **Search results list is tiny** (max-h-40 = ~160px) — hard to scan through results
2. **No typeahead/autocomplete** — must wait for debounced search, then click from list
3. **Mode toggle is subtle** — easy to miss Search/Chain/Manual tabs
4. **Selected state is disconnected** — after selecting, "Change" button resets everything
5. **No keyboard navigation** — can't arrow through results or press Enter to select
6. **Recent/Favorites tabs hidden** — useful features buried behind tiny tab buttons
7. **Option Chain nested inside search** — the chain component duplicates underlying selection UI that could be simplified

### Proposed Improvements

#### 1. Unified Combobox-Style Picker (biggest UX win)
Replace the current search input + results list with a **combobox pattern**:
- Single input field that shows results as you type (dropdown below)
- Recent items shown immediately on focus (before typing)
- Favorites pinned at the top with a star
- Arrow keys to navigate, Enter to select, Escape to close
- Taller results area (max-h-64 instead of max-h-40)

#### 2. Smarter Defaults & Context
- When segment is Options/Futures, **auto-set exchange to NFO** and show a compact inline message: "Tip: Use Option Chain for faster F&O selection"
- Remember last used exchange filter per segment in localStorage
- Show lot size inline for F&O instruments in results

#### 3. Improved Selected State
- Show a compact **chip-style** selected instrument instead of the current full-width bar
- "Change" opens the picker inline (no full reset) — preserves recent search context
- LTP fetch button more prominent with last-fetched timestamp

#### 4. Keyboard Navigation in Search Results
- Add `onKeyDown` handler to search input
- ArrowUp/ArrowDown to highlight results
- Enter to select highlighted item
- Track `highlightedIndex` state

#### 5. Option Chain Quick Access
- When segment = Options, show **Option Chain as the default** (already done) but also add a small "Switch to Search" link instead of equal-weight tabs
- Make the chain component more compact — remove redundant labels

#### 6. Exchange Filter as Chips (not buttons)
- Replace the 4 full buttons (ALL/NSE/NFO/MCX) with smaller badge-style chips to save vertical space

### Files to Modify
- `src/components/trade/InstrumentPicker.tsx` — main refactor: combobox pattern, keyboard nav, improved layout
- `src/components/trade/OptionChainSelector.tsx` — minor: tighten spacing, remove redundant header when embedded

### Implementation Order
1. Add keyboard navigation (ArrowUp/Down/Enter) to search results
2. Increase results area height and show lot size for F&O
3. Replace exchange filter buttons with compact chips
4. Add "remember last exchange" per segment
5. Improve selected state with chip-style display
6. Add focus-triggered recent items display

