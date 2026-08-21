# FinSense — AI-Powered Agentic System for Autonomous Personal Finance Monitoring and Advisory

A mobile-first personal finance app with an autonomous AI agent that monitors your money, flags spending anomalies, auto-categorizes transactions, and delivers proactive financial advice.

## Features

- **AI Agent Advisor** — chat with an agent that answers financial questions and logs its reasoning
- **Autonomous Monitoring** — agent activity log, spending alerts, and AI-generated insights
- **SMS-based Expense Tracking** — automatic parsing of bank/UPI SMS into transactions
- **Dashboard** — net worth, spending snapshot, credit card bills, goal progress, portfolio summary
- **Budgets** — monthly budgets with category breakdowns and overspend alerts
- **Investments** — portfolio tracking with allocation charts
- **Goals** — savings goals with progress rings and agent suggestions
- **Reports** — monthly/annual reports, spending trends, export
- **Subscriptions & Tools** — subscription manager and FIRE calculator
- **Auth & Security** — sign up/login, OTP verification, biometric login

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Expo SDK 54, React Native 0.81, React 19, TypeScript |
| **Styling** | NativeWind (TailwindCSS), Reanimated, SVG charts |
| **State** | Zustand, TanStack React Query |
| **Navigation** | React Navigation (native-stack, bottom-tabs) |
| **Database** | Supabase (PostgreSQL) |
| **ML Backend** | Python, FastAPI, scikit-learn, joblib |
| **Testing** | Jest, React Native Testing Library |

## Project Structure

```
.
├── frontend/                          # React Native (Expo) mobile app
│   ├── src/
│   │   ├── components/
│   │   │   ├── agent/                 # AgentActionLog, AgentChatWindow, ChatInput
│   │   │   ├── auth/                  # BiometricButton
│   │   │   ├── budgets/               # BudgetForm, BudgetProgressBar, CategoryBreakdownChart
│   │   │   ├── dashboard/             # NetWorthCard, SpendingSnapshot, QuickActions
│   │   │   ├── goals/                 # GoalForm, GoalProgressRing, AgentSuggestionCard
│   │   │   ├── investments/           # AllocationChart, AssetList, PortfolioValueStat
│   │   │   ├── layout/                # AppShell, BottomTabBar, TopBar, Screen
│   │   │   ├── notifications/         # NotificationFilter
│   │   │   ├── onboarding/            # ProfileSetupForm, ConnectBankForm, ConnectUpiForm
│   │   │   ├── reports/               # SpendingTrendChart, CategoryBreakdownChart, ExportButton
│   │   │   ├── settings/              # ProfileEditor, SecuritySettings, AgentAutonomySlider
│   │   │   ├── splash/                # AnimatedLogoReveal
│   │   │   ├── transactions/          # TransactionList, TransactionDetail, ReceiptScanner
│   │   │   └── ui/                    # Card, Toast, ErrorBoundary, charts/
│   │   ├── hooks/
│   │   │   ├── useAgentActions.ts
│   │   │   ├── useAgentInsights.ts
│   │   │   ├── useAssets.ts
│   │   │   ├── useBudgets.ts
│   │   │   ├── useChat.ts
│   │   │   ├── useConnectedAccounts.ts
│   │   │   ├── useCreditCardBills.ts
│   │   │   ├── useGoals.ts
│   │   │   ├── useNetWorth.ts
│   │   │   ├── useNotifications.ts
│   │   │   ├── useProfile.ts
│   │   │   ├── useRecurringTransactions.ts
│   │   │   ├── useSmsMonitor.ts
│   │   │   ├── useSmsTracking.ts
│   │   │   ├── useSpendingAlerts.ts
│   │   │   ├── useSyncInvestments.ts
│   │   │   ├── useTransactions.ts
│   │   │   └── useUpiAccounts.ts
│   │   ├── navigation/
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AuthNavigator.tsx
│   │   │   ├── MainTabNavigator.tsx
│   │   │   ├── MoreNavigator.tsx
│   │   │   └── SmsTrackingNavigator.tsx
│   │   ├── screens/
│   │   │   ├── auth/                  # LoginScreen, SignUpScreen, OtpVerificationScreen
│   │   │   ├── dashboard/             # DashboardScreen
│   │   │   ├── transactions/          # TransactionsScreen
│   │   │   ├── budgets/               # BudgetsScreen
│   │   │   ├── goals/                 # GoalsScreen
│   │   │   ├── investments/           # InvestmentsScreen
│   │   │   ├── insights/              # InsightsScreen
│   │   │   ├── advisor/               # AdvisorScreen
│   │   │   ├── reports/               # ReportsScreen, MonthlyReportScreen
│   │   │   ├── subscriptions/         # SubscriptionsScreen
│   │   │   ├── notifications/         # NotificationsScreen
│   │   │   ├── settings/              # SettingsScreen
│   │   │   ├── onboarding/            # OnboardingScreen, CarouselScreen, SyncingScreen
│   │   │   ├── smsTracking/           # AutomaticExpenseScreen, ScanningTransactionsScreen
│   │   │   ├── splash/                # AnimatedSplashScreen
│   │   │   └── tools/                 # FireCalculatorScreen
│   │   ├── services/
│   │   │   ├── supabase/              # client.ts, config.ts
│   │   │   ├── budgetLimits.ts
│   │   │   ├── config.ts
│   │   │   ├── creditCardBills.ts
│   │   │   └── exchangeRates.ts
│   │   ├── store/
│   │   │   ├── agentStore.ts
│   │   │   ├── authStore.ts
│   │   │   ├── filterStore.ts
│   │   │   ├── smsTrackingStore.ts
│   │   │   ├── spendingAlertStore.ts
│   │   │   ├── themeStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── calcProgress.ts
│   │       ├── calcProjection.ts
│   │       ├── detectRecurring.ts
│   │       ├── fireCalculator.ts
│   │       ├── formatCurrency.ts
│   │       ├── formatDate.ts
│   │       ├── netWorth.ts
│   │       └── savingsSuggestions.ts
│   ├── modules/
│   │   └── sms-reader/                # Custom Expo native module (Kotlin Android)
│   ├── supabase/
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_upi_accounts.sql
│   │   │   └── 003_sms_monitoring.sql
│   │   ├── migration.sql
│   │   └── seed.sql
│   ├── scripts/
│   │   └── seed.mjs
│   ├── android/                       # Android native build files
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── babel.config.js
│
├── backend/                           # Python ML pipeline
│   ├── ml/
│   │   ├── api/
│   │   │   ├── main.py                # FastAPI endpoints
│   │   │   └── schemas.py             # Pydantic models
│   │   ├── train/
│   │   │   ├── anomaly_detection.py   # Spending anomaly detection
│   │   │   ├── budget_optimizer.py    # Budget optimization
│   │   │   ├── categorize.py          # Transaction categorization
│   │   │   ├── goal_predictor.py      # Goal achievement prediction
│   │   │   └── spending_forecast.py   # Spending forecast
│   │   ├── models/                    # Trained .joblib model files
│   │   │   ├── anomaly_model.joblib
│   │   │   ├── anomaly_scaler.joblib
│   │   │   ├── budget_model.joblib
│   │   │   ├── categorize_model.joblib
│   │   │   ├── categorize_encoder.joblib
│   │   │   ├── categorize_vectorizer.joblib
│   │   │   ├── categorize_payment_encoder.joblib
│   │   │   ├── goal_model.joblib
│   │   │   ├── spending_forecast_model.joblib
│   │   │   └── training_summary.json
│   │   ├── data/
│   │   │   ├── preprocess.py          # Data preprocessing pipeline
│   │   │   ├── export_data.py         # Data export utility
│   │   │   ├── transactions.json
│   │   │   ├── accounts.json
│   │   │   ├── budgets.json
│   │   │   ├── goals.json
│   │   │   └── processed_transactions.json
│   │   ├── scripts/
│   │   │   ├── train_all.py           # Train all models
│   │   │   └── retrain_kaggle.py      # Retrain with Kaggle data
│   │   └── requirements.txt
│   ├── _zip_extract/                  # Design reference (HTML + screenshots)
│   ├── CLAUDE.md
│   └── bank_statements.csv.csv
│
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Expo CLI (`npx expo`)
- A Supabase project

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Apply database schema
# Run SQL from supabase/migrations/ in Supabase SQL editor

# Seed demo data (optional)
node scripts/seed.mjs

# Start app
npm start
```

### Backend Setup

```bash
cd backend/ml
pip install -r requirements.txt

# Train all models
python scripts/train_all.py

# Start API server
python api/main.py
```

### Testing

```bash
cd frontend
npm test
```

## SMS Tracking

SMS-based expense tracking requires a native build since it uses a custom Expo module (`modules/sms-reader`) to read SMS with user permission.

```bash
cd frontend
npm run android   # Android native build
npm run ios       # iOS native build
```

## Database Schema

SQL migrations are in `frontend/supabase/migrations/`:

1. `001_initial_schema.sql` — core tables (profiles, transactions, accounts)
2. `002_upi_accounts.sql` — UPI account tracking
3. `003_sms_monitoring.sql` — SMS-based expense monitoring

## ML Models

The backend trains 5 ML models:

| Model | Purpose |
|-------|---------|
| Anomaly Detection | Flags unusual spending patterns |
| Budget Optimizer | Suggests optimal budget allocation |
| Transaction Categorizer | Auto-categorizes transactions |
| Goal Predictor | Predicts goal achievement timeline |
| Spending Forecaster | Forecasts future spending |
