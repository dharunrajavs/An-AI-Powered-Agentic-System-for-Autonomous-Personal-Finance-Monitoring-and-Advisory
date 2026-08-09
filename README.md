# FinSense — AI-Powered Agentic System for Autonomous Personal Finance Monitoring and Advisory

A mobile-first personal finance app (Expo / React Native) featuring an autonomous AI agent that monitors your money, flags spending anomalies, auto-categorizes transactions, and delivers proactive financial advice through a chat interface.

## Features

- **AI Agent Advisor** — chat with an agent that answers questions about your finances, suggests actions, and logs its reasoning in an action trail
- **Autonomous monitoring** — agent activity log, spending alerts, and agent-generated insights on your dashboard
- **SMS-based expense tracking** — automatic parsing of bank/UPI SMS into transactions (custom Expo native module, `modules/sms-reader`), manual import, and expense summaries
- **Dashboard** — net worth, spending snapshot, credit card bills, goal progress, and portfolio summary
- **Budgets** — monthly budgets with category breakdowns and overspend alerts
- **Investments** — portfolio tracking with allocation charts
- **Goals** — savings goals with progress rings and agent suggestions
- **Reports** — monthly/annual reports, spending trends, payment-method breakdowns, export
- **Subscriptions & tools** — subscription manager and FIRE calculator
- **Auth & security** — sign up/login, OTP verification, biometric login (Face ID / fingerprint)
- **Onboarding** — multi-step setup: connect bank, UPI accounts, goals, and agent preferences

## Tech Stack

- **Framework:** Expo SDK 54, React Native 0.81, React 19
- **Navigation:** React Navigation (native-stack, bottom-tabs)
- **State & data:** Zustand, TanStack React Query (with async-storage persister)
- **Styling:** NativeWind (Tailwind CSS), Reanimated, SVG charts
- **Backend:** Supabase (auth, database), PostgreSQL migrations in `supabase/`
- **AI:** OpenAI-powered chat with structured prompts (`src/services/ai`)
- **Forms & validation:** React Hook Form + Zod
- **Testing:** Jest + React Native Testing Library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npx expo` works out of the box)
- A Supabase project

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables (copy `.env.example` to `.env` and fill in your Supabase credentials):

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Apply the database schema to your Supabase project (SQL editor or `supabase/migrations/`):

   ```bash
   # optionally seed demo data
   node scripts/seed.mjs
   ```

4. Start the app:

   ```bash
   npm start        # Expo dev server
   npm run android  # Android (native build, requires SMS reader module)
   npm run ios      # iOS
   npm run web      # web
   ```

### Testing

```bash
npm test
```

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components (agent, dashboard, charts, ...)
│   ├── hooks/          # Data-hooks (transactions, budgets, goals, ...)
│   ├── navigation/     # Stack/tab navigators
│   ├── screens/        # Screens (dashboard, advisor, budgets, sms tracking, ...)
│   ├── services/       # API, AI, Supabase, SMS parsing, mock data
│   ├── store/          # Zustand stores
│   ├── types/          # Shared TypeScript types
│   └── utils/          # Helpers (currency, dates, projections, ...)
├── modules/sms-reader/ # Custom Expo native module for reading SMS
├── supabase/           # SQL migrations and seed
└── scripts/            # Utility scripts
```

## SMS Tracking

SMS-based expense tracking requires a native build (`npm run android` / `npm run ios`) since it uses a custom Expo module (`modules/sms-reader`) to read SMS with the user's permission.
