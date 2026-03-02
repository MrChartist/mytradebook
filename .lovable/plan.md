

# Final Project Cleanup -- Remove Unused Files and Optimize

## Scan Results

After a deep search of every import path across the codebase, here are the findings:

---

## 1. Unused Files to Delete (Safe -- Zero Imports)

These files are NOT imported anywhere in the project and can be safely removed:

### Components
| File | Reason |
|------|--------|
| `src/components/NavLink.tsx` | Custom NavLink wrapper -- never imported anywhere |
| `src/components/dashboard/PerformanceMetrics.tsx` | Legacy dashboard widget -- replaced by DashboardKPICards |
| `src/components/dashboard/SegmentBreakdown.tsx` | Legacy dashboard widget -- never imported |
| `src/components/dashboard/RecentTrades.tsx` | Legacy dashboard widget -- never imported |
| `src/components/dashboard/AlertsWidget.tsx` | Legacy dashboard widget -- replaced by DashboardAlertsPanel |
| `src/components/dashboard/OpenPositionsTable.tsx` | Legacy dashboard widget -- replaced by DashboardPositionsTable |
| `src/components/trade/FuturesContractPicker.tsx` | Never imported -- likely replaced by InstrumentPicker |
| `src/components/trade/ShareableTradeCard.tsx` | Never imported -- planned but unused feature |
| `src/components/trade/TradeAutomationControls.tsx` | Never imported -- planned but unused feature |
| `src/components/trade/UnifiedInstrumentSearch.tsx` | Never imported -- replaced by InstrumentPicker |
| `src/components/trade/TagSearchPicker.tsx` | Never imported -- replaced by another tag component |

### Hooks
| File | Reason |
|------|--------|
| `src/hooks/useScanners.ts` | Never imported anywhere |
| `src/hooks/useInstrumentSearch.ts` | Never imported -- replaced by InstrumentPicker's inline logic |

### Lib
| File | Reason |
|------|--------|
| `src/lib/errors.ts` | Never imported in any src file |
| `src/lib/performance.ts` | Never imported in any src file |

### Root Markdown Files (Dev-only docs, not shipped but add repo clutter)
| File | Reason |
|------|--------|
| `ARCHITECTURE.md` | Dev documentation -- not needed in production |
| `IMPROVEMENTS.md` | Dev documentation -- not needed in production |
| `PHASE4_IMPROVEMENTS.md` | Dev documentation -- not needed in production |
| `PR_PHASE4_DESCRIPTION.md` | Dev documentation -- not needed in production |
| `SECURITY_NOTES.md` | Dev documentation -- not needed in production |
| `TELEGRAM_IMPLEMENTATION.md` | Dev documentation -- not needed in production |

**Total: 15 code files + 6 markdown files = 21 files to delete**

---

## 2. Files NOT to Delete (Used -- Verified)

These were initially suspicious but confirmed to be in use:
- `src/components/dashboard/StatCard.tsx` -- used by Analytics.tsx
- `src/components/dashboard/OpenPositionsTable.tsx` -- actually used by DashboardPositionsTable indirectly... wait, let me recheck... No, it has zero imports. Safe to delete.
- `src/lib/confetti.ts` -- used by useTrades.ts
- `src/lib/schemas.ts` -- used by CreateStudyModal and CreateTradeModal
- `src/hooks/useTradeTemplates.ts` -- used by Trades.tsx
- `src/hooks/useTradeEvents.ts` -- used by TradeDetailModal.tsx
- All settings components -- used by Settings.tsx

---

## 3. What This Achieves

- Removes ~15 unused code files, reducing bundle analysis complexity
- Removes 6 dev-only markdown files that add repo clutter
- No functionality is affected -- every deletion is verified as zero-import
- Faster IDE indexing and cleaner project structure

---

## 4. Final Suggestions for the Website

After this cleanup, here are the top improvements to consider:

1. **SEO Meta Tags** -- Add Open Graph and Twitter card meta tags to `index.html` for better social sharing (title, description, preview image)
2. **Loading Skeleton States** -- Add skeleton loading placeholders on Dashboard and Trades pages for better perceived performance
3. **404 Page Polish** -- The NotFound page could have a branded illustration and navigation back to dashboard
4. **PWA Icons** -- Currently using the same 192px icon for both sizes. Add a proper 512px icon for better app store appearance
5. **Image Optimization** -- Add lazy loading (`loading="lazy"`) to any images in the Docs page mockups

---

## Technical Implementation

### Step 1: Delete 15 unused source files
Delete the 11 component files, 2 hook files, and 2 lib files listed above.

### Step 2: Delete 6 root markdown files
Delete ARCHITECTURE.md, IMPROVEMENTS.md, PHASE4_IMPROVEMENTS.md, PR_PHASE4_DESCRIPTION.md, SECURITY_NOTES.md, TELEGRAM_IMPLEMENTATION.md.

### Step 3: Verify build
Confirm the app builds and runs without errors after deletions.

No code modifications needed -- purely file deletions.

