# Claude Development Guide for MyTradeBook

## Project Overview

**MyTradeBook** is a comprehensive trade journaling and analytics platform for traders. It helps track trades, analyze performance, manage risk, and improve trading discipline through detailed logging and analytics.

### Tech Stack

- **Frontend Framework**: React 18.3 + TypeScript 5.8
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS + shadcn-ui components
- **State Management**: React Query (TanStack), React Context
- **Backend**: Supabase with PostgreSQL
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for analytics and Konva for drawing on charts
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint

## Project Structure

```
src/
├── components/
│   ├── dashboard/          # Dashboard widgets and KPI cards
│   ├── analytics/          # Analytics dashboards and charts
│   ├── journal/            # Journal views and components
│   ├── trade/              # Trade-related components
│   ├── modals/             # Modal dialogs for create/edit operations
│   ├── settings/           # Settings pages
│   ├── telegram/           # Telegram integration components
│   └── layout/             # Layout components (sidebar, main layout)
├── lib/                    # Utilities and helpers
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
├── styles/                 # Global styles
└── App.tsx                 # Main app component
```

## Key Features

- **Trade Logging**: Create and manage detailed trade records with entry/exit points, profit/loss
- **Dashboard**: Real-time KPIs, equity curve, positions overview
- **Analytics**: Performance analysis by day/time, segment analysis, risk-reward metrics, streaks
- **Journal**: Calendar view, Kanban board, pattern tracking
- **Alerts**: Create and manage trading alerts
- **Studies**: Custom studies for analysis
- **Settings**: User preferences, security, Telegram integration
- **Telegram Integration**: Alert delivery via Telegram

## Development Guidelines

### Code Style & Conventions

1. **TypeScript**: All files should use `.tsx` or `.ts` extensions with strict type checking
2. **Component Structure**: Use functional components with hooks
3. **Naming**:
   - Components: PascalCase (`TradeCard.tsx`)
   - Utilities/hooks: camelCase (`useTradeData.ts`, `calculateMetrics.ts`)
   - Constants: UPPER_SNAKE_CASE
4. **Imports**: Group imports as: React/libs → types → components → utilities
5. **No Unused Code**: Delete unused variables, imports, and functions
6. **Comments**: Only add comments for non-obvious logic; prefer self-documenting code

### React Best Practices

- Use TypeScript for all component props (avoid `any` type)
- Implement error boundaries for error handling
- Use React Query for server state and caching
- Memoize expensive computations with `useMemo`
- Use `useCallback` for event handlers passed to child components
- Keep components focused and small (single responsibility)

### Styling

- Use Tailwind CSS utility classes for styling
- Use shadcn-ui components for UI consistency
- Keep component-specific styles in component files
- Avoid inline styles unless necessary

### Testing

- Run tests with: `npm run test`
- Watch mode: `npm run test:watch`
- Write tests for complex business logic
- Test file naming: `ComponentName.test.tsx` or `utils.test.ts`

## Development Workflow

### Running the Project

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm build

# Run tests
npm test

# Run linter
npm lint
```

### Making Changes

1. Create changes on the designated branch
2. Test locally with `npm run dev`
3. Run tests: `npm test` and linting: `npm lint`
4. Commit with clear, descriptive messages
5. Push to the branch when complete

### Commit Message Format

Use conventional commit style:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for code refactoring
- `docs:` for documentation updates
- `test:` for test additions/updates
- `style:` for formatting/styling changes

Example: `feat: add trade performance analytics by weekday`

## Important Context

### Authentication & Security

- Supabase handles authentication (email/password via `@lovable.dev/cloud-auth-js`)
- Environment variables in `.env` (see `.env.example`)
- Sensitive data (API keys, tokens) must not be committed

### Database Structure

- Trades table: user trades with entry/exit, PnL
- Alerts table: trading alerts for positions
- Studies table: custom studies for analysis
- Telegram tokens/user IDs for integration

### Performance Considerations

- Use React Query for data caching and refetching
- Lazy load heavy components with React.lazy()
- Optimize charts with appropriate update frequencies
- Use virtualization for long lists if needed

## When I Work on Your Code

### I Will

✅ Follow the established patterns and conventions
✅ Maintain TypeScript strict mode compliance
✅ Keep changes minimal and focused on the task
✅ Test changes locally before completing
✅ Write clear commit messages
✅ Preserve existing code structure and organization

### I Won't

❌ Add unnecessary dependencies
❌ Make "improvements" beyond what's requested
❌ Add premature abstractions or over-engineer solutions
❌ Remove or significantly refactor untouched code
❌ Skip tests or linting
❌ Commit to branches other than the designated development branch

## Contact & Resources

- **Main Branch**: `main` (production)
- **Development**: Work on designated feature branches (`claude/*`)
- **Documentation**: See ARCHITECTURE.md for detailed system design
- **Security**: See SECURITY_NOTES.md for security considerations

## Git Branch Information

All development work should be pushed to the branch specified in the development instructions. The branch name should follow the pattern `claude/[feature-name]-[session-id]`.

**Do not** push to `main` or other branches without explicit permission.
