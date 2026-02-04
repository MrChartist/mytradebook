

# Multi-User Trading Platform - Complete Implementation Plan

## Current State Analysis

### What's Built (Frontend UI Only)
- **7 Page Layouts**: Dashboard, Studies, Alerts, Trades, Journal, Reports, Settings
- **Design System**: Dark theme with trading colors (profit/loss), glass-card components
- **Static Mock Data**: All pages display hardcoded sample data
- **UI Components**: Sidebar navigation, charts, tables, cards

### What's NOT Working
1. **Non-functional Buttons**: "New Alert", "New Trade", "New Study", Edit, Delete buttons have no actions
2. **No Backend/Database**: All data is hardcoded - nothing persists
3. **No Authentication**: Login page simulates OTP but doesn't actually authenticate
4. **No Integrations**: Dhan API, Telegram Bot, Google OAuth are not connected
5. **No Background Workers**: No alert evaluation, trade monitoring, or report generation
6. **Mobile Menu**: Hamburger icon doesn't open a navigation drawer

---

## Implementation Roadmap

### Phase 1: Enable Cloud and Database Setup (Foundation)

#### 1.1 Enable Lovable Cloud
- Retry Cloud enablement for database and authentication
- This provides PostgreSQL, Edge Functions, and Authentication

#### 1.2 Create Database Schema
Migration files to create all required tables:

**Tables to Create:**
- `profiles` - User profile data linked to auth.users
- `user_roles` - Separate roles table (Admin/Client) for security
- `user_settings` - User preferences and integration settings
- `studies` - Market analysis entries with category and tags
- `alerts` - Price and technical condition alerts
- `trades` - Trade entries with segment, entry/exit, SL/targets
- `trade_events` - Trade lifecycle events (entry, SL hit, target hit)
- `pattern_tags`, `candlestick_tags`, `mistake_tags` - Journal tagging taxonomy
- `trade_patterns`, `trade_mistakes` - Many-to-many tag relationships
- `weekly_reports` - Generated weekly summaries

**Security Setup:**
- Row Level Security (RLS) policies on all tables
- Security definer function `has_role()` for role checking
- Users can only access their own data

---

### Phase 2: Authentication System

#### 2.1 Google OAuth Login
- Configure Supabase Google provider
- Implement `signInWithOAuth({ provider: 'google' })`
- Handle auth state changes with `onAuthStateChange`
- Auto-create profile on first login via database trigger

#### 2.2 Phone OTP Login
- Create Edge Function for OTP generation and verification
- Store hashed OTP in `otp_codes` table with 5-minute expiry
- Integrate SMS gateway (Twilio/AWS SNS) for sending OTP
- Rate limit: 5 OTP requests per 15 minutes

#### 2.3 Auth Context and Protected Routes
- Create `AuthContext` provider with session state
- Build `ProtectedRoute` wrapper component
- Redirect unauthenticated users to `/login`
- Store user session and role in context

---

### Phase 3: Core CRUD Features

#### 3.1 Alerts Module
- **Create Alert Modal**: Form with symbol, condition type (Price Above/Below/% Change), threshold, recurrence
- **Database Operations**: Insert, update, toggle active, delete alerts
- **Real-time Updates**: Supabase real-time subscription for alert status
- **Type Safety**: Zod schema validation for all forms

#### 3.2 Studies Module
- **Create Study Modal**: Title, symbol, category, notes, tags
- **Image Attachments**: Supabase Storage for chart screenshots
- **Tag Management**: Add/remove tags dynamically
- **Edit/Delete**: Full CRUD with confirmation dialogs

#### 3.3 Trades Module
- **Create Trade Modal**: Symbol, segment, type (BUY/SELL), quantity, entry price, SL, targets, rating, confidence
- **Trade Table**: Real data from database with filters
- **Trade Detail View**: Full trade info with event timeline
- **Close Trade**: Manual closure with P&L calculation

#### 3.4 Journal Module
- **Pattern Tagging**: Link trades to patterns, candlesticks, mistakes
- **Analytics Queries**: Win rate by pattern, mistake impact calculations
- **Calendar View**: Trade history calendar with daily P&L
- **Kanban Board**: Mistake review workflow

---

### Phase 4: API Integrations

#### 4.1 Dhan API Integration
- **Edge Function**: `dhan-sync` for portfolio synchronization
- **Secrets Required**: `DHAN_CLIENT_ID`, `DHAN_ACCESS_TOKEN`
- **Sync Logic**: Fetch positions from Dhan, match with local trades
- **Order Execution**: Send buy/sell orders via Dhan API

#### 4.2 Telegram Bot Integration
- **Edge Function**: `telegram-notify` for sending messages
- **Secret Required**: `TELEGRAM_BOT_TOKEN`
- **User Setting**: Store individual `telegram_chat_id` per user
- **Message Templates**: Trade alerts, SL/Target hits, weekly reports
- **Markdown Formatting**: Professional message styling

#### 4.3 Google OAuth
- Configure in Supabase Dashboard (requires user action)
- Set redirect URLs correctly
- Handle OAuth callback in Login page

---

### Phase 5: Background Workers (Edge Functions + Cron)

#### 5.1 Alert Evaluator
- **Edge Function**: `evaluate-alerts`
- **Schedule**: Every 5 minutes via pg_cron
- **Logic**: 
  - Fetch active alerts
  - Get current prices (from Dhan or market data API)
  - Evaluate conditions
  - Trigger Telegram notification if matched
  - Update `last_triggered` and `trigger_count`

#### 5.2 Trade Monitor
- **Edge Function**: `monitor-trades`
- **Schedule**: Every 1 minute for open positions
- **Logic**:
  - Fetch open trades
  - Get current prices
  - Check if SL or targets hit
  - Create trade events
  - Send Telegram updates
  - Auto-execute orders via Dhan (if configured)

#### 5.3 Weekly Reporter
- **Edge Function**: `generate-weekly-report`
- **Schedule**: Monday 6:00 AM IST via pg_cron
- **Logic**:
  - Aggregate trades from previous week
  - Segment by trade type
  - Calculate metrics (P&L, win rate, best/worst)
  - Store in `weekly_reports` table
  - Send to Telegram and email

---

### Phase 6: UI Enhancements

#### 6.1 Mobile Navigation Drawer
- Sheet component for mobile menu
- Trigger from hamburger button
- Same navigation items as desktop sidebar

#### 6.2 Loading States
- Skeleton loaders for data fetching
- Toast notifications for success/error
- Optimistic updates for better UX

#### 6.3 Form Validation
- Zod schemas for all input forms
- react-hook-form integration
- Field-level error messages

---

## Technical Architecture

### File Structure for New Code

```text
src/
  contexts/
    AuthContext.tsx          # Authentication state management
  hooks/
    useAuth.ts               # Auth helper hooks
    useAlerts.ts             # Alerts CRUD hooks
    useStudies.ts            # Studies CRUD hooks
    useTrades.ts             # Trades CRUD hooks
  components/
    modals/
      CreateAlertModal.tsx   # Alert creation form
      CreateStudyModal.tsx   # Study creation form
      CreateTradeModal.tsx   # Trade entry form
      TradeDetailModal.tsx   # Trade detail view
      ConfirmDeleteModal.tsx # Deletion confirmation
    layout/
      MobileDrawer.tsx       # Mobile navigation
      ProtectedRoute.tsx     # Auth guard component
  lib/
    supabase.ts              # Supabase client
    schemas.ts               # Zod validation schemas
  integrations/
    supabase/
      client.ts              # Supabase client config
      types.ts               # Generated TypeScript types

supabase/
  migrations/
    001_create_profiles.sql
    002_create_user_roles.sql
    003_create_studies.sql
    004_create_alerts.sql
    005_create_trades.sql
    006_create_journal_tags.sql
    007_create_weekly_reports.sql
  functions/
    telegram-notify/
      index.ts
    dhan-sync/
      index.ts
    evaluate-alerts/
      index.ts
    generate-weekly-report/
      index.ts
```

### Database Relationships

```text
auth.users (Supabase managed)
    |
    +-- profiles (1:1)
    |
    +-- user_roles (1:many, separate for security)
    |
    +-- user_settings (1:1)
    |
    +-- studies (1:many)
    |
    +-- alerts (1:many)
    |
    +-- trades (1:many)
            |
            +-- trade_events (1:many)
            |
            +-- trade_patterns (many:many via pattern_tags)
            |
            +-- trade_mistakes (many:many via mistake_tags)
```

---

## Implementation Priority

| Priority | Feature | Effort | Dependencies |
|----------|---------|--------|--------------|
| 1 | Enable Cloud | Low | None |
| 2 | Database Schema | Medium | Cloud |
| 3 | Auth (Google OAuth) | Medium | Cloud |
| 4 | Alerts CRUD | Medium | Auth |
| 5 | Trades CRUD | Medium | Auth |
| 6 | Studies CRUD | Low | Auth |
| 7 | Mobile Navigation | Low | None |
| 8 | Telegram Integration | Medium | Secrets |
| 9 | Dhan API Integration | High | Secrets |
| 10 | Background Workers | High | All above |
| 11 | Weekly Reports | Medium | Trades + Telegram |

---

## Secrets Required

Before integrations can work, you'll need to add these secrets:

| Secret Name | Purpose | Where to Get |
|-------------|---------|--------------|
| `TELEGRAM_BOT_TOKEN` | Send notifications | @BotFather on Telegram |
| `DHAN_CLIENT_ID` | Trading API | Dhan Developer Portal |
| `DHAN_ACCESS_TOKEN` | Trading API | Dhan Developer Portal |

---

## Immediate Next Steps

**Recommended Order:**
1. Enable Lovable Cloud (retry)
2. Create database migrations for core tables
3. Implement Google OAuth authentication
4. Add Create Alert modal with database persistence
5. Add Create Trade modal with database persistence
6. Fix mobile navigation drawer

