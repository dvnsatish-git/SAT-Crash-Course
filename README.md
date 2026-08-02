# SAT Prep — AI Coach

A personal, mobile-first Digital SAT prep app: adaptive practice, timed exams, a
6-week study plan, spaced-repetition error log, gamification, and an AI coach.

## Stack

- Next.js (App Router) + TypeScript, no external UI framework — plain inline styles
- Storage: `localStorage` synced to a Redis instance (via `ioredis`, standard `redis://` protocol) per anonymous device ID — no accounts/auth
- AI: Anthropic (Claude) for the tutor chat, AI-generated practice questions, and error explanations

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
npm run dev
```

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No | Enables the AI Tutor chat, AI-generated practice questions, and AI error explanations. Without it, the tutor/generation features are unavailable and error explanations fall back to a deterministic mock analysis — the app is fully usable without this key. |
| `REDIS_URL` (a standard `redis://user:pass@host:port` string — the app also accepts a Vercel-injected project-specific name like `<integration>_REDIS_URL`) | No, but recommended | Backs cross-device sync and the read-only Parent Dashboard share link. Without it, all data stays in the browser's `localStorage` only — a parent link opened on a different device/browser will show empty data since there's nothing server-side to read. |

## Features

- **Practice** (`/practice`) — adaptive topic drills; weak topics surface more often, with optional AI-generated questions
- **Quick Quiz** (`/quiz`) — short timed reps (Reel/Rocket/Beast/Legend modes)
- **Exam** (`/exam`) — timed practice exam with a rough score estimate
- **Plan** (`/plan`) — written 6-week day-by-day curriculum
- **Score Tracker** (`/tracker`) — log practice/official test scores with source labeling (Bluebook, Question Bank, Khan Academy, UWorld, 1600.io, etc.) and optional domain-level breakdowns
- **Error Log** (`/errors`) — every wrong answer in Practice/Quiz/Exam is captured automatically; categorize, schedule spaced reviews (1/3/7/14/30-day), mark mastered, get an AI explanation
- **Analytics** (`/analytics`) — score trend, domain accuracy, error-category breakdown, weakest/strongest skills, plan completion, and a parent share link
- **Parent Dashboard** (`/parent/[code]`) — read-only aggregate progress view; no edit access, no individual mistakes or notes exposed
- Gamification — XP, daily streaks, levels, and badges shown on the dashboard, earned from practice/quiz/exam/review/plan activity

## Content & guardrails

All questions in `app/lib/questions.ts` are original, unofficial practice content.
The app does not copy, scrape, or redistribute questions from College Board,
Bluebook, Khan Academy, UWorld, or other proprietary sources. AI-generated
questions and explanations are clearly labeled as unofficial and avoid
guaranteeing score outcomes.

## Development

```bash
npm run dev         # start the dev server
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build        # production build
```

There is currently no automated test suite (Vitest/Playwright); verify UI
changes by running the dev server and exercising the feature in a browser.

## Deployment

Deploys to Vercel (see `vercel.json`). Add the environment variables above in
the Vercel project settings — connecting a Redis database via Vercel's Storage
tab (Marketplace → Redis/Upstash) will inject a `redis://` connection string
automatically under a project-specific variable name.
