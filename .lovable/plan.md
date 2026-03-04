

## Revamp Option Chain Selector UX

### Problem
The current strike list shows 40+ badges in a flat grid, making it hard to find the right strike. No way to quickly jump to ATM or filter the range.

### Changes to `src/components/trade/OptionChainSelector.tsx`

#### 1. Option Chain Grid View (CE | Strike | PE)
Replace the badge grid + separate CE/PE step with a traditional option chain table layout:
- Three columns: **CALL LTP | Strike | PUT LTP**
- ATM row highlighted with a distinct background
- Click any CE or PUT cell to select that contract instantly (removes the separate Step 4)
- Reduces steps from 4 to 3 (Underlying → Expiry → Click on chain)

#### 2. Strike Range Filter
Add a compact range control above the chain:
- Three quick buttons: `±5`, `±10`, `±20` (default ±10)
- Reduces visible rows from 40 to a manageable count

#### 3. Auto-scroll to ATM
- Use a `useRef` + `scrollIntoView` to center the ATM row when strikes load

#### 4. Quick ATM Shortcut
- Add an "ATM" button that instantly selects the at-the-money strike and opens CE/PE choice

#### 5. Strike Search Input
- Small input field above the chain: type a number to jump/filter to that strike

### UI Layout (after selecting underlying + expiry)

```text
┌─────────────────────────────────────────┐
│  Range: [±5] [±10] [±20]   Strike: [___]│
├──────────┬─────────┬───────────────────┤
│  CE LTP  │ Strike  │  PE LTP           │
├──────────┼─────────┼───────────────────┤
│   120.50 │  22400  │   45.30           │
│    85.20 │  22450  │   62.80           │
│    52.10 │ ★22500  │   88.40  ← ATM    │
│    30.80 │  22550  │  118.50           │
│    15.40 │  22600  │  152.20           │
├──────────┴─────────┴───────────────────┤
│ Selected: NIFTY 06MAR26 22500CE        │
│ LTP: ₹52.10           [Use Contract]  │
└─────────────────────────────────────────┘
```

### Flow Change
- Steps 1-2 remain the same (Underlying → Expiry)
- Step 3 becomes the grid: user clicks a CE or PE cell directly
- Step 4 (CE/PE toggle) is eliminated — the click on the cell determines it
- Preview and confirm bar appears below the grid

### Files
- `src/components/trade/OptionChainSelector.tsx` — full rewrite of the strike selection area

