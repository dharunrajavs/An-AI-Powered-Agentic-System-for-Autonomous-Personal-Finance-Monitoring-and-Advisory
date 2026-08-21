# FinSense — PPT Content (Empathize → Define → Ideate)

**Project:** An AI-Powered Agentic System for Autonomous Personal Finance Monitoring and Advisory
**App name:** FinSense

---

## SLIDE 1 — Title
- **FinSense**
- An AI-Powered Agentic System for Autonomous Personal Finance Monitoring and Advisory
- Team: [Your Names]
- [Date / Semester / Course]

---

## SLIDE 2 — Agenda
1. Empathize — Understanding the user & problem
2. Define — Framing the problem
3. Ideate — Brainstorming solutions
4. Next Steps — Prototype & Test

---

# PHASE 1: EMPATHIZE

## SLIDE 3 — Problem Context
- Personal finance is **fragmented**: money is spread across banks, UPI apps (GPay, PhonePe), credit cards, mutual funds, and subscriptions.
- **Problem:** Users don't know their real financial picture.
- **Why:**
  - Tracking spending manually is tedious → people give up
  - Bills/subscriptions go unnoticed → money leaks silently
  - No single place to see net worth, budgets, goals, and investments
  - Generic advice doesn't fit individual behavior

## SLIDE 4 — User Research (Methods Used)
- **Interviews** with young professionals & students (age 20–35)
- **Surveys** on spending habits and app usage
- **Observation** of how users currently track money (spreadsheets, notes, memory)
- **Competitive analysis** — existing apps (Mint, YNAB, CRED, Walnut)

## SLIDE 5 — Key Insights (Empathy Findings)
- "I have 4 apps + a bank app — I never know my total balance."
- "I only notice subscriptions when money's already gone."
- "I want to be told things, not have to dig for them."
- "UPI gives me 100 notifications a day — they're useless, but the *transaction SMS* is everything."
- People don't need more data — they need **actionable, proactive guidance**.

## SLIDE 6 — User Personas

**Persona 1 — Aarav (26, Software Engineer)**
- Earns well, spends on food/entertainment, saves irregularly
- Goals: track spend without effort, build emergency fund
- Frustrations: manual tracking, never knows monthly spend total
- Quote: "I know I'm spending too much, but I don't know where."

**Persona 2 — Priya (31, Product Manager)**
- Manages salary, rent, investments (MF/SIP), credit card
- Goals: one dashboard, bill reminders, smarter investing
- Frustrations: fragmented accounts, missed credit card due dates
- Quote: "I just want one app that watches my money for me."

## SLIDE 7 — Empathy Map (Summary)
- **Says:** "I don't have time to track expenses", "Why is my balance so low?"
- **Thinks:** "I should save more", "My subscriptions are eating my money"
- **Does:** Checks bank apps daily, ignores UPI notifications, uses notes app to budget
- **Feels:** Anxious about money, overwhelmed by multiple apps, motivated after payday
- **Pain:** No visibility, manual effort, no timely warnings
- **Gain:** Peace of mind, automated tracking, proactive alerts, personalized advice

---

# PHASE 2: DEFINE

## SLIDE 8 — Problem Statement
> **"Young professionals and students struggle to understand and control their personal finances because data is scattered across multiple apps, tracking is manual, and advice is not timely or personalized. They need an autonomous system that monitors their money, flags issues, and advises them proactively — without them having to ask."**

## SLIDE 9 — How Might We...? (Problem Framing)
- HMW make expense tracking **zero-effort** (automatic)?
- HMW give users **one unified view** of all their money?
- HMW proactively **detect and alert** on anomalies (overspend, double charges, missed bills)?
- HMW deliver financial advice that feels **personal, not generic**?
- HMW make money monitoring **trustworthy and private**?

## SLIDE 10 — Scope (In / Out of Scope)
**In scope:**
- Automatic expense tracking (SMS parsing for bank/UPI)
- Unified dashboard (net worth, spending, bills, goals, portfolio)
- AI agent with chat + proactive insights
- Budgets, savings goals, investments, reports, FIRE calculator, subscriptions
- Secure auth (OTP, biometrics)

**Out of scope (v1):**
- Direct bank account aggregation (API-level, open banking)
- Bill payments & money transfers
- Investment execution (trading)

## SLIDE 11 — Functional Requirements (Summary)
1. Parse bank/UPI SMS → auto-categorize transactions
2. Dashboard: net worth, spending snapshot, bills, goals, portfolio
3. AI advisor: answer questions, suggest actions, log reasoning ("action trail")
4. Autonomous monitoring: anomaly/overspend alerts, agent insights
5. Budgets with category breakdown + overspend alerts
6. Savings goals with progress rings + agent suggestions
7. Reports: monthly/annual trends, payment-method breakdown, export
8. Onboarding: connect bank, UPI, set goals & agent preferences
9. Auth & security: signup/login, OTP, biometric login

---

# PHASE 3: IDEATE

## SLIDE 12 — Ideation Process
- Brainstormed 25+ ideas → grouped into 5 directions
- Used prioritization matrix: **Impact vs. Effort**
- Selected the highest-impact, feasible ideas for v1

## SLIDE 13 — Solution Directions Considered
| Direction | Idea | Verdict |
|---|---|---|
| A | Chatbot that answers financial questions | ✔ Kept (core) |
| B | Full banking APIs (Plaid-style) | ✘ Deferred (hard to access in India, SMS is feasible) |
| C | Manual ledger + reports only | ✘ Rejected (no autonomy, high effort for user) |
| D | Notification-based alert bot only | ✔ Folded into autonomous monitoring |
| E | Investment auto-trading | ✘ Rejected (risk & compliance) |

**Winning concept:** A **mobile app with an autonomous AI agent** that reads transaction data (from SMS) and proactively monitors, alerts, and advises — while remaining a chat interface away.

## SLIDE 14 — Core Solution: Agentic AI Concept
- The system acts like a **personal financial co-pilot** that works autonomously:
  1. **Watch** — ingests transactions automatically (SMS → ledger)
  2. **Understand** — auto-categorizes, tracks budgets, net worth, goals
  3. **Alert** — flags anomalies: overspend, duplicate charges, missed bills, sub renewals
  4. **Advise** — proactive insights + chat with an AI advisor
  5. **Explain** — every agent action is logged in a visible "action trail" (trust & transparency)

## SLIDE 15 — Feature Set (Ideated)
- **AI Agent Advisor** — chat; answers questions, suggests actions; logs reasoning
- **Autonomous monitoring** — agent activity log, spending alerts, generated insights
- **SMS-based expense tracking** — auto-parse bank/UPI SMS; manual import; summaries
- **Dashboard** — net worth, spending snapshot, credit card bills, goal progress, portfolio
- **Budgets** — monthly budgets, category breakdown, overspend alerts
- **Investments** — portfolio tracking with allocation charts
- **Goals** — savings goals, progress rings, agent suggestions
- **Reports** — monthly/annual reports, trends, payment-method breakdown, export
- **Subscriptions & Tools** — subscription manager, FIRE calculator
- **Security** — OTP auth, biometric login (Face ID/fingerprint)
- **Onboarding** — connect bank, UPI, goals, and agent preferences

## SLIDE 16 — High-Level Architecture (Ideated)
```
User
 │ (Expo / React Native app)
 ▼
Mobile App ──► Supabase (Auth, PostgreSQL, RLS)
 │                ▲
 │                │
 └──► AI Services (OpenAI, structured prompts)
         ├── Transaction categorization
         ├── Agent chat + insight generation
         └── Action trail / reasoning logs
Modules:
  SMS Reader (native module) ──► Transaction parser ──► Ledger
```

## SLIDE 17 — Tech Stack (Ideated & Selected)
- **Frontend:** Expo SDK 54, React Native 0.81, React 19
- **Navigation:** React Navigation (native-stack, bottom-tabs)
- **State & Data:** Zustand, TanStack React Query (+ async-storage persister)
- **UI:** NativeWind (Tailwind), Reanimated, SVG charts, IBM Plex fonts
- **Backend:** Supabase (auth, PostgreSQL, migrations, seed)
- **AI:** OpenAI-powered chat with structured prompts
- **Forms:** React Hook Form + Zod validation
- **Testing:** Jest + React Native Testing Library

## SLIDE 18 — Wireframe / Screen Map (Ideated)
- Splash → Onboarding (bank, UPI, goals, agent prefs)
- Bottom Tabs: **Home (Dashboard)** • **Advisor (AI Chat)** • **Transactions** • **Budgets** • **More**
- Stack: SMS Tracking, Reports, Investments, Goals, Subscriptions, FIRE Calculator, Notifications, Settings
- Key screens:
  - Dashboard: net worth card, spending snapshot, bill alerts, agent insights
  - Advisor: chat UI + agent action trail panel
  - SMS tracking: auto-import status, manual import, category summaries

## SLIDE 19 — Risks & Mitigations (Ideated)
| Risk | Mitigation |
|---|---|
| SMS privacy concerns | Local parsing + permission flow, on-device consent, secure storage |
| LLM hallucination in advice | Structured prompts, financial-only scope, action trail transparency |
| No real bank APIs | SMS-based ingestion; design for future API connectors |
| Data accuracy of categorization | Confidence-based categorization + easy manual correction |

---

## SLIDE 20 — Next Steps
- **Prototype:** high-fidelity screens in Expo (working app as prototype)
- **Test:** usability tests with 5–8 users, feedback on dashboard clarity & agent trust
- Iterate: refine alerts, prompt quality, and onboarding

## SLIDE 21 — Thank You / Q&A
- FinSense — Your money, watched.
- Questions welcome.

---

## Speaker Notes (Brief)
- **Slide 3–5:** Ground the problem in real research — emphasize "scattered data + manual tracking + generic advice."
- **Slide 8:** Read the problem statement slowly — it is the anchor of the whole project.
- **Slide 13:** Highlight why SMS ingestion was chosen over bank APIs (feasibility) — shows pragmatism in ideation.
- **Slide 14:** This is the "wow" slide — the agentic watch→understand→alert→advise→explain loop.
- **Slide 18:** Show the app's actual screens if possible; tie wireframes to the implemented product.
