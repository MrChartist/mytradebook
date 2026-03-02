

# Move Mockup Visuals Inside FeatureCards (Below Description)

## Current Layout
```text
+-------------------+
| Mockup (separate) |
+-------------------+

+-------------------+
| FeatureCard       |
|   Icon + Title    |
|   Description     |
|   Feature List    |
+-------------------+
```

## New Layout
```text
+---------------------+
| FeatureCard         |
|   Icon + Title      |
|   Description       |
|   Feature List      |
|                     |
|   +---------------+ |
|   | Mockup Visual | |
|   +---------------+ |
+---------------------+
```

The mockup visual moves inside the card, placed after all text content. This applies to every section across the entire Docs page.

---

## Changes

### File: `src/pages/Docs.tsx`

For every instance where a mockup component sits above a FeatureCard, move it inside the FeatureCard's children, after the existing description/FeatureList content. Add a `mt-4` spacing class wrapper around the mockup when placed inside.

**Sections affected (all of them):**

1. **Dashboard** -- `TodaysPnlHeroMockup`, `KPICardsDetailMockup`, `RiskGaugeDetailMockup`, `EquityCurveWidgetMockup`, `StreakDisciplineMockup`, `CalendarHeatmapWidgetMockup`, `WidgetCustomizerMockup`, `SegmentFilterMockup`
2. **Trade Management** -- `CreateTradeMockup`, `TradeStatusLifecycleMockup`, `TSLDetailMockup`, `MultiLegStrategyDetailMockup`, `PositionSizingDetailMockup`, `PostTradeReviewMockup`, `TradeTemplateMockup`
3. **Alerts** -- `AlertConditionTypesMockup`, `RecurrenceCooldownMockup`, `DeliveryChannelsMockup`, `AlertManagementMockup`
4. **Studies** -- `StudyCategoryWorkflowMockup`, `PatternTaggingMockup`, `StudyAdditionalFeaturesMockup`
5. **Watchlists** -- `WatchlistDetailMockup`
6. **Journal** -- `JournalDashboardTabMockup`, `JournalCalendarTabMockup`, `JournalMistakesTabMockup`, `JournalFiltersSegmentationMockup`
7. **Calendar & Daily Journal** -- `DailyJournalWorkflowMockup`
8. **Mistakes** -- `MistakeAnalysisToolsMockup`
9. **Weekly Reports** -- (WeeklyReportMockup stays as section-level intro)
10. **Integrations** -- `DhanIntegrationDetailMockup`, `TelegramIntegrationDetailMockup`
11. **Keyboard Shortcuts** -- `KeyboardShortcutsDetailMockup`
12. **Settings** -- `SettingsProfileBillingMockup`, `SettingsPreferencesMockup`, `SettingsTagManagementMockup`, `CapitalManagementMockup`, `SettingsSecurityMockup`, `SettingsIntegrationsMockup`

**Example transformation (before/after):**

Before:
```jsx
<RiskGaugeDetailMockup />
<FeatureCard icon={Gauge} title="Risk Gauge & Goal Tracker">
  <p className="text-sm text-muted-foreground">
    Visualize your daily risk...
  </p>
</FeatureCard>
```

After:
```jsx
<FeatureCard icon={Gauge} title="Risk Gauge & Goal Tracker">
  <p className="text-sm text-muted-foreground">
    Visualize your daily risk...
  </p>
  <div className="mt-4">
    <RiskGaugeDetailMockup />
  </div>
</FeatureCard>
```

**Section-level overview mockups** (like `DashboardMockup`, `OnboardingFlowMockup`, `MobileAppMockup`, `StudyCardMockup`, `WatchlistMockup`, `TradeCardMockup`, the top-level alert/telegram pair, the calendar pair, and `ShortcutKeyboardMockup`) will remain outside cards as section intros since they are broad overviews, not tied to a specific FeatureCard.

### File: `src/components/docs/DocsMockups.tsx`

Update `MockupFrame` to remove the top/bottom margin (`my-6`, `my-4`) since spacing will now be controlled by the parent `mt-4` wrapper inside FeatureCards. Change the default margin to `my-0` and let individual standalone usages pass `className="my-6"` explicitly.

Alternatively, a simpler approach: keep MockupFrame as-is but override margin when inside cards using the `mt-4` wrapper div. This avoids touching every mockup component.

---

## Summary
- ~50 mockup placements will be moved from above their FeatureCard to inside (below text content)
- Section-level intro mockups remain standalone
- No new components or dependencies needed
- Single file primarily modified: `src/pages/Docs.tsx`
