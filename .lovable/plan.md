

# Custom Filter Builder for Stock Scanner

Add an expandable filter builder panel between the preset strip and the table, allowing users to compose custom AND-conditions on any available metric.

## Design

A collapsible panel toggled by a "Custom Filter" button in the preset strip. Each filter row has three parts: **Field** (select), **Operator** (select), and **Value** (number input). Users can add up to 8 filter rows. When custom filters are active, presets are deselected and the header badge shows "Custom".

```text
┌─────────────────────────────────────────────────────┐
│ [Field ▼]  [Operator ▼]  [Value ___]  [× remove]   │
│ [Field ▼]  [Operator ▼]  [Value ___]  [× remove]   │
│ [+ Add condition]           [Apply]  [Clear all]    │
└─────────────────────────────────────────────────────┘
```

## Available Filter Fields

Map friendly labels to TradingView scanner field names (reuse existing `FIELD_KEY_MAP` from the edge function):

| Label | TV Field |
|---|---|
| P/E Ratio | `price_earnings_ttm` |
| P/B Ratio | `price_book_ratio` |
| ROE (%) | `return_on_equity` |
| Net Margin (%) | `net_margin` |
| Dividend Yield (%) | `dividends_yield` |
| Debt/Equity | `debt_to_equity` |
| Current Ratio | `current_ratio` |
| Market Cap | `market_cap_basic` |
| RSI | `RSI` |
| Change (%) | `change` |
| Volume | `volume` |
| Relative Volume | `relative_volume_10d_calc` |
| EPS | `earnings_per_share_basic_ttm` |
| Beta | `beta_1_year` |

## Operators

- `greater` → ">"
- `less` → "<"
- `egreater` → "≥" (use `greater` since TV supports it)
- `eless` → "≤" (use `less`)

Keep it simple: just `>` and `<` which map directly to TradingView's `greater` and `less` operations.

## Implementation — `src/pages/Fundamentals.tsx`

1. **State**: Add `customFilters: { field: string; op: string; value: string }[]` and `showFilterBuilder: boolean` states.

2. **Filter Builder Toggle**: Add a "Custom Filter" button at the end of the preset strip. When clicked, expand the builder panel and deselect any preset.

3. **Filter Builder UI**: A `Collapsible` panel with a card containing filter rows. Each row is a flex container with:
   - Field `Select` dropdown (from the field list above)
   - Operator `Select` (> or <)
   - Number `Input` for value
   - `X` button to remove the row

4. **Add/Apply/Clear**: "Add condition" button appends a blank row. "Apply" converts the custom filters to `ScanFilter[]` and passes them to `useFundamentals`. "Clear all" resets and returns to the "All" preset.

5. **Active filters badge**: When custom filters are active, show a count badge on the filter button and display active filter chips above the table.

6. **Integration with existing presets**: Clicking a preset clears custom filters. Activating custom filters deselects the current preset (set `presetId` to a special `"custom"` value).

7. **Query integration**: When `presetId === "custom"`, pass `customFilters` (converted to `ScanFilter[]`) to `useFundamentals` instead of `preset.filters`.

## File Changes

| File | Change |
|---|---|
| `src/pages/Fundamentals.tsx` | Add filter builder state, UI panel, integration with query hook |

No database or edge function changes needed — the existing `tradingview-scan` function already supports arbitrary filters.

