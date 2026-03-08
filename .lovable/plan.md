

## Plan: Remove ComparisonTable from Docs

Remove all 4 `ComparisonTable` instances and its import from `src/pages/Docs.tsx`.

### Changes in `src/pages/Docs.tsx`:

1. **Line 57**: Remove `ComparisonTable` from the import statement
2. **Lines 550–564**: Delete the "Free vs Pro — At a Glance" comparison table (Getting Started section)
3. **Lines 703–716**: Delete the "Dashboard Features — Free vs Pro" comparison table
4. **Lines 1004–1012**: Delete the "Position Sizing — Free vs Pro" comparison table
5. **Lines 1778–1787**: Delete the "AI Trade Coach — Free vs Pro" comparison table

No functional or layout changes — just removing these blocks. Surrounding content (ProTips, section dividers, motion wrappers) remains intact.

