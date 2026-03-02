

# Enhance FAQ Section -- More Questions + Docs Preview + Better UI

## Current State
The FAQ section has 5 questions in a simple accordion layout. It works but feels thin -- traders would have more questions, and there's no connection to the comprehensive Docs page that already exists.

## Plan

### 1. Expand to 10 FAQs (Grouped into Two Columns)
Add 5 more trader-relevant questions and split them into a **2-column grid on desktop** (single column on mobile) to fill the space better and feel more comprehensive:

**New FAQs to add:**
- "What broker integrations are supported?" -- Currently Dhan with live sync; CSV import for all brokers (Zerodha, Angel One, Groww, Upstox, etc.)
- "Can I track F&O and multi-leg strategies?" -- Yes, full options support with multi-leg strategies, Greeks tracking, and strategy-level P&L
- "Do you have AI-powered insights?" -- Yes, AI analyzes your trading patterns, identifies recurring mistakes, and suggests improvements
- "Can I set alerts and notifications?" -- Price alerts, portfolio alerts, and Telegram notifications for real-time monitoring
- "Is there a trading rules checklist?" -- Yes, create pre-trade checklists to enforce discipline before every trade

### 2. Add "Explore Full Docs" CTA Below FAQ
After the accordion, add a visually rich card that previews the Docs page:
- A compact card with a gradient border showing: "Want to dive deeper?" heading
- 3-4 mini topic pills (Getting Started, Trade Management, Analytics, AI Insights) representing doc sections
- A "Browse Documentation" button linking to `/docs`
- This bridges FAQ curiosity to the full documentation hub

### 3. Visual Polish
- Widen the container from `max-w-2xl` to `max-w-3xl` to accommodate the 2-column layout
- Add a subtle description line below the heading: "Everything you need to know about TradeBook"
- Add numbered category labels on each accordion item (subtle, like the reference)
- On open, show a subtle accent left-border highlight on the active item
- Add `dot-pattern` background to the section for consistency with other sections

## Technical Changes

### File: `src/pages/Landing.tsx`

**FAQ data array (lines 1362-1367):**
- Expand from 5 to 10 FAQ items with richer answers

**FAQ layout (lines 1361-1378):**
- Change container from `max-w-2xl` to `max-w-3xl`
- Split the accordion into a 2-column `grid grid-cols-1 md:grid-cols-2 gap-x-6` layout
- Each column gets its own `Accordion` with 5 items each

**Section wrapper (line 1348):**
- Add `dot-pattern` class to section background

**New Docs preview card (after line 1378):**
- Insert a `motion.div` card with gradient border, topic pills, and CTA button linking to `/docs`
- Uses existing `Button` component and `BookOpen` icon from lucide-react

**Heading area (lines 1350-1359):**
- Add subtitle paragraph: "Everything you need to know about TradeBook"

### No new files or dependencies needed

