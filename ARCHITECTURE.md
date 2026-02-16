# MyTradeBook Architecture Documentation

## 📐 System Overview

MyTradeBook is a comprehensive trading journal application built with a modern stack:
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **UI Library**: shadcn/ui + Radix UI
- **State Management**: React Query + React Context
- **Styling**: Tailwind CSS

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Components (src/components)                │  │
│  │  ├─ Dashboard, Trades, Alerts, Journal, etc.     │  │
│  │  └─ UI Components (shadcn/ui + Radix)            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  State Management                                 │  │
│  │  ├─ React Query (server state)                   │  │
│  │  ├─ React Context (auth, global state)           │  │
│  │  └─ Custom Hooks (data fetching + logic)         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│              Supabase (Backend Services)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                              │  │
│  │  ├─ Tables: trades, alerts, studies, etc.        │  │
│  │  ├─ Row-Level Security (RLS)                     │  │
│  │  ├─ Audit Log + Soft Delete                      │  │
│  │  └─ Indexes (20+ for performance)                │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Edge Functions (Deno)                            │  │
│  │  ├─ dhan-auth, dhan-sync, dhan-execute           │  │
│  │  ├─ telegram-verify, telegram-notify             │  │
│  │  ├─ evaluate-alerts, get-live-prices             │  │
│  │  └─ instrument-sync, generate-weekly-report      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Supabase Storage                                 │  │
│  │  ├─ trade-charts (chart images)                  │  │
│  │  └─ study-attachments (research files)           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Supabase Auth                                    │  │
│  │  ├─ Email/Password                                │  │
│  │  ├─ Google OAuth                                  │  │
│  │  └─ Session Management                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────┐
│            External Services (Integrations)              │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  Dhan Broker API  │  │  Telegram Bot API │           │
│  │  - Market Data    │  │  - Notifications  │           │
│  │  - Order Execute  │  │  - Verification   │           │
│  │  - Portfolio Sync │  │  - Rich Messages  │           │
│  └──────────────────┘  └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
mytradebook/
├── src/
│   ├── components/          # React components
│   │   ├── analytics/       # Performance analytics components
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── journal/         # Trading journal components
│   │   ├── layout/          # Layout components (nav, sidebar)
│   │   ├── modals/          # Modal dialogs
│   │   ├── settings/        # Settings forms
│   │   ├── trade/           # Trade management UI
│   │   ├── ui/              # shadcn/ui base components
│   │   └── ErrorBoundary.tsx # Error boundary wrapper
│   │
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   │
│   ├── hooks/               # Custom React hooks (20+ hooks)
│   │   ├── useAlerts.ts
│   │   ├── useAuth.ts
│   │   ├── useTrades.ts
│   │   ├── useLivePrices.ts
│   │   ├── useJournalAnalytics.ts
│   │   └── ...
│   │
│   ├── integrations/        # External service integrations
│   │   ├── supabase/        # Supabase client & types
│   │   └── lovable/         # Lovable OAuth integration
│   │
│   ├── lib/                 # Shared utilities
│   │   ├── constants.ts     # App constants (Phase 3)
│   │   ├── errors.ts        # Error handling utilities (Phase 2)
│   │   ├── calculations.ts  # Trading calculations (Phase 3)
│   │   ├── formatting.ts    # Display formatting (Phase 3)
│   │   └── telegram.ts      # Telegram helpers
│   │
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Dashboard
│   │   ├── Trades.tsx       # Trade management
│   │   ├── Alerts.tsx       # Alert management
│   │   ├── Journal.tsx      # Trading journal
│   │   ├── Analytics.tsx    # Performance analytics
│   │   └── Settings.tsx     # User settings
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── trade.ts         # Trade-related types (Phase 2)
│   │
│   ├── App.tsx              # Root app component
│   └── main.tsx             # Entry point
│
├── supabase/
│   ├── functions/           # Edge functions (Deno)
│   │   ├── _shared/         # Shared utilities (Phase 1)
│   │   │   ├── errors.ts    # Standardized error handling
│   │   │   ├── logger.ts    # Structured logging
│   │   │   ├── retry.ts     # Retry logic
│   │   │   └── validation.ts # Input validation
│   │   ├── dhan-auth/       # Dhan OAuth flow
│   │   ├── dhan-sync/       # Portfolio synchronization
│   │   ├── dhan-execute/    # Order execution
│   │   ├── telegram-verify/ # Telegram verification
│   │   ├── telegram-notify/ # Telegram notifications
│   │   ├── evaluate-alerts/ # Alert evaluation
│   │   ├── get-live-prices/ # Live market data
│   │   └── instrument-sync/ # Scrip master sync
│   │
│   └── migrations/          # Database migrations (22 files)
│       ├── 20260216000001_add_performance_indexes.sql
│       └── 20260216000002_add_audit_fields.sql
│
├── public/                  # Static assets
├── .env.example            # Environment template (Phase 1)
├── IMPROVEMENTS.md          # Phase 1+2 documentation
├── SECURITY_NOTES.md        # Security audit results (Phase 1)
├── ARCHITECTURE.md          # This file (Phase 3)
└── README.md               # Project overview

```

---

## 🔄 Data Flow

### 1. Trade Creation Flow
```
User Input → CreateTradeModal
    ↓
useAlerts.createAlert()
    ↓
Supabase Insert (with RLS check)
    ↓
React Query Invalidation
    ↓
UI Update (optimistic)
    ↓
Telegram Notification (if enabled)
```

### 2. Alert Evaluation Flow
```
Cron Trigger (every 5 min)
    ↓
evaluate-alerts Edge Function
    ↓
Fetch Active Alerts (RLS filtered)
    ↓
For Each User:
  - Fetch Dhan Credentials
  - Get Live Prices (via Dhan API)
  - Check Alert Conditions
  - If Triggered:
      - Update Alert Status
      - Send Telegram Notification
      - Create Chain Alerts (if configured)
```

### 3. Dhan Portfolio Sync Flow
```
User Clicks "Sync Portfolio"
    ↓
dhan-sync Edge Function
    ↓
Fetch Orders from Dhan API
    ↓
Match Buy/Sell Pairs
    ↓
Calculate P&L
    ↓
Create/Update Trades in DB
    ↓
Return Summary to User
```

---

## 🔐 Security Architecture

### Row-Level Security (RLS)
Every database table has RLS enabled with policies like:
```sql
-- Users can only see their own trades
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Service role (edge functions) can bypass RLS
-- But must validate user_id in application logic
```

### Authentication Flow
1. User signs in (email/password or Google OAuth)
2. Supabase creates session + JWT token
3. JWT stored in localStorage (httpOnly not possible in SPA)
4. Every API request includes JWT in Authorization header
5. RLS policies validate JWT and filter data by user_id

### API Security
- **Edge Functions**: Use service role key (server-side)
- **Frontend**: Uses publishable key (limited permissions)
- **Input Validation**: All edge functions validate inputs (Phase 1 utilities)
- **Rate Limiting**: TODO (planned for Phase 4)

---

## 📊 Database Schema

### Core Tables

**trades** (main trading records)
- `id`, `user_id`, `symbol`, `trade_type`, `quantity`
- `entry_price`, `exit_price`, `stop_loss`, `targets` (JSONB)
- `status` (PENDING, OPEN, CLOSED, CANCELLED)
- `segment` (Equity Intraday, Futures, Options, etc.)
- `pnl`, `pnl_percent`, `rating`, `confidence_score`
- Indexes: user_id, status, entry_time, composite (user+status+date)

**alerts** (price/volume alerts)
- `id`, `user_id`, `symbol`, `condition_type`, `threshold`
- `recurrence` (ONCE, DAILY, CONTINUOUS)
- `is_active`, `trigger_count`, `cooldown_minutes`
- `previous_ltp` (for cross detection)
- Indexes: user_id, is_active, recurrence

**studies** (trading research notes)
- `id`, `user_id`, `title`, `content`, `tags`
- `attachments` (JSONB), `created_at`

**strategy_trades** (multi-leg options strategies)
- `id`, `user_id`, `strategy_name`, `legs` (JSONB)
- `total_pnl`, `max_loss`, `max_profit`

### Supporting Tables

**user_settings** (user preferences + integrations)
- `dhan_client_id`, `dhan_access_token`, `dhan_token_expiry`
- `telegram_chat_id`, `telegram_enabled`
- `default_sl_percent`, `starting_capital`
- `ra_public_mode`, `ra_disclaimer`

**telegram_chats** (multi-destination routing)
- `id`, `user_id`, `chat_id`, `chat_name`
- `segments` (array), `custom_bot_token`

**instrument_master** (50K+ scrip master)
- `security_id`, `trading_symbol`, `exchange`, `lot_size`
- `expiry`, `strike`, `option_type`
- Indexes: trading_symbol, exchange, security_id

**audit_log** (change tracking for compliance)
- `table_name`, `record_id`, `action`, `old_values`, `new_values`
- `user_id`, `changed_at`, `changed_by_function`

### Junction Tables (M2M)
- `trade_patterns` (trades ↔ pattern_tags)
- `trade_mistakes` (trades ↔ mistake_tags)
- `watchlist_items` (watchlists ↔ instruments)

---

## 🎨 Frontend Architecture

### State Management Strategy

**Server State** (React Query)
- Trades, Alerts, Studies, Settings
- Automatic caching, refetching, invalidation
- Stale time: 1-10 minutes depending on data type

**Client State** (React Context)
- Authentication (user, session, profile)
- Global UI state (theme, sidebar collapsed)

**Local State** (useState)
- Form inputs, modal open/closed
- Component-specific UI state

### Component Patterns

**Container/Presentational**
```tsx
// Container (with logic)
function TradesContainer() {
  const { trades, isLoading } = useTrades();
  return <TradesList trades={trades} loading={isLoading} />;
}

// Presentational (pure UI)
function TradesList({ trades, loading }: Props) {
  return <div>{/* render trades */}</div>;
}
```

**Custom Hooks Pattern**
```tsx
// Encapsulate data fetching + logic
function useTrades(filters?: TradeFilters) {
  // React Query for data
  const query = useQuery({ ... });

  // Mutations for actions
  const createTrade = useMutation({ ... });

  // Computed values
  const summary = useMemo(() => calculateSummary(query.data), [query.data]);

  return { trades, summary, createTrade, ... };
}
```

### Error Handling Layers

1. **Error Boundaries** (Component crashes)
   ```tsx
   <ErrorBoundary>
     <App />
   </ErrorBoundary>
   ```

2. **Query Error Handling** (API failures)
   ```tsx
   const { data, error, isError } = useQuery({ ... });
   if (isError) return <ErrorMessage error={error} />;
   ```

3. **Form Validation** (User input)
   ```tsx
   const schema = z.object({ ... });
   const form = useForm({ resolver: zodResolver(schema) });
   ```

---

## 🚀 Performance Optimizations

### Implemented (Phase 1-3)

1. **Database Indexes** (20+ indexes)
   - Foreign keys, composite indexes, partial indexes
   - 10-100x faster queries

2. **React Query Caching**
   - Automatic stale-while-revalidate
   - Background refetching

3. **Code Splitting**
   - Route-based code splitting with React Router
   - Lazy loading of heavy components

4. **Memoization**
   - `useMemo` for expensive calculations
   - `useCallback` for stable function references

5. **AbortController**
   - Cancel in-flight requests on unmount
   - Prevent memory leaks

### TODO (Phase 4+)

- [ ] Virtual scrolling for long lists (react-window)
- [ ] Replace polling with WebSocket/Realtime
- [ ] Service Worker for offline capability
- [ ] Bundle size analysis and optimization
- [ ] Image lazy loading and optimization

---

## 🧪 Testing Strategy

### Current State
- No automated tests (TODO)

### Recommended Approach

**Unit Tests** (Vitest)
- Utility functions (calculations, formatting)
- Custom hooks (with @testing-library/react-hooks)

**Integration Tests** (Vitest + Testing Library)
- Component interactions
- Form submissions
- Data fetching flows

**E2E Tests** (Playwright/Cypress)
- Critical user flows
- Trade creation → notification → journal

---

## 📦 Deployment

### Frontend Build
```bash
npm run build
# Output: dist/ folder (static assets)
# Deploy to: Vercel, Netlify, Cloudflare Pages
```

### Supabase
- Database: Auto-hosted by Supabase
- Edge Functions: Deploy via Supabase CLI
  ```bash
  supabase functions deploy telegram-verify
  ```
- Migrations: Apply via Supabase dashboard or CLI
  ```bash
  supabase db push
  ```

### Environment Variables
```bash
# Frontend (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...

# Edge Functions (Supabase Dashboard)
TELEGRAM_BOT_TOKEN=<bot_token>
DHAN_API_URL=https://api.dhan.co
```

---

## 🔧 Development Workflow

### Local Development
```bash
# Start dev server
npm run dev

# Run type checking
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit with conventional commits
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/your-feature
```

### Database Migrations
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database (dev only)
supabase db reset
```

---

## 📚 Key Design Decisions

### Why Supabase?
- **Rapid Development**: Auth, database, storage out of the box
- **Row-Level Security**: Built-in multi-tenancy
- **Edge Functions**: Serverless backend logic
- **Real-time**: PostgreSQL pub/sub for live updates

### Why React Query?
- **Server State**: Automatic caching and synchronization
- **Less Boilerplate**: No need for manual cache management
- **Better UX**: Loading states, error handling, refetching

### Why shadcn/ui?
- **Customizable**: Copy-paste components, not npm package
- **Accessible**: Built on Radix UI primitives
- **Type-Safe**: Full TypeScript support

### Why Edge Functions over Traditional Backend?
- **Serverless**: No server management
- **Scalable**: Auto-scales with traffic
- **Fast**: Deploy globally via CDN
- **Cost-Effective**: Pay per execution

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No WebSocket**: Using polling (30s interval)
2. **No Pagination**: All trades loaded at once
3. **No Multi-Tenancy**: One Dhan account per user
4. **No Offline Mode**: Requires internet connection
5. **No Real-Time Collaboration**: Single-user focused

### Technical Debt
1. **Strict TypeScript**: Not fully enabled (strictNullChecks off)
2. **Test Coverage**: 0% (no tests written yet)
3. **Bundle Size**: Not optimized (no tree shaking analysis)
4. **Accessibility**: Missing ARIA labels in some components

---

## 🔮 Future Enhancements

### Phase 4 (Scalability)
- Replace polling with Supabase Realtime
- Implement pagination and virtual scrolling
- Add request deduplication
- Implement proper caching strategy

### Phase 5 (Features)
- Multi-broker support (Zerodha, Upstox)
- Paper trading mode
- Social features (share journal publicly)
- Mobile app (React Native)

### Phase 6 (Advanced)
- AI-powered trade analysis
- Backtesting engine
- Automated trading strategies
- Tax report generation

---

## 📞 Support & Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- React Query Docs: https://tanstack.com/query/latest
- shadcn/ui Docs: https://ui.shadcn.com

### Code Quality
- ESLint Configuration: `eslint.config.js`
- TypeScript Config: `tsconfig.json`
- Improvements Log: `IMPROVEMENTS.md`
- Security Notes: `SECURITY_NOTES.md`

---

**Last Updated**: February 16, 2026
**Version**: 1.0.0 (Post Phase 1-3 Improvements)
