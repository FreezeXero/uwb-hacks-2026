# Ascend

> Discipline is a team sport.

A gamified accountability app where friends compete on streaks, AI verifies your quests, and squads lock in together. Built at **UWB Hacks 2026**.

![Built with Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square)

---

## The pitch

Existing habit trackers can't tell if you actually did anything. Habitica trusts you. Streaks trusts you. Way of Life trusts you. They're glorified checkbox apps.

**Ascend doesn't trust you.** Every quest you log gets verified by Claude with a quick conversational check. Be specific or get rejected. Squad quests lock all four members in: if even one person flakes, nobody gets the bonus. Live events make it a real-time game, not a static checklist.

That's the difference between honor-system tracking and real accountability.

---

## Features

- **AI quest verification** — Claude (Sonnet 4.5) checks each quest with a brief conversation. "Did pushups" gets rejected. "30 pushups, 3 sets of 10, took 8 minutes" gets approved.
- **9-rank ladder** — Bronze → Silver → Gold → Platinum → Diamond → Champion → Grandmaster → Legendary → **Surreal** (white-glow rank for the global top 3 only)
- **Streak multipliers** — 1× → 1.25× → 1.5× → 2× XP that scale with your active streak. Miss a day, lose your boost.
- **Squads of 4** — group quests where ALL members must complete or no bonus drops. Built-in social pressure.
- **Live events** — limited-time challenges with XP multipliers (UWB Hack Week, April Grind, Squad Wars)
- **AI coach** — Claude-powered chatbot suggests quests tailored to your goals, with one-tap adopt
- **Friends + Global leaderboards** — compete with your circle, see where you sit worldwide
- **Custom avatars** — DiceBear-generated illustrated characters or upload your own
- **Push notifications** — streak risk alerts, friend nudges, squad activity, rank-ups

---

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript + JavaScript |
| UI | React 19 + Tailwind CSS 4 |
| Auth | Auth0 |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic Claude API (Sonnet 4.5) |
| Avatars | DiceBear (generated SVGs) |
| Icons | Lucide React |

---

## Setup

### Prerequisites

You'll need the following installed:

- **Node.js 20+** — download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node) or **pnpm** / **yarn**
- **Git** — [git-scm.com](https://git-scm.com/)
- A **Supabase** account ([supabase.com](https://supabase.com/) — free tier works)
- An **Auth0** account ([auth0.com](https://auth0.com/) — free tier works)
- An **Anthropic API key** ([console.anthropic.com](https://console.anthropic.com/))

### 1. Clone the repo

```bash
git clone https://github.com/FreezeXero/uwb-hacks-2026.git
cd uwb-hacks-2026
```

### 2. Install dependencies

```bash
npm install
```

This installs Next.js, React, Tailwind, Supabase client, Auth0 SDK, Anthropic SDK, DiceBear, Lucide, and everything else listed in `package.json`.

### 3. Configure environment variables

Create a file called `.env.local` in the project root (same level as `package.json`). Copy this template and fill in your own values:

```env
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Auth0
AUTH0_SECRET=                 # generate with: openssl rand -hex 32
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
APP_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Important:**
- `.env.local` is gitignored — never commit it.
- Generate `AUTH0_SECRET` by running `openssl rand -hex 32` in your terminal.
- In your Auth0 dashboard, set the **Allowed Callback URL** to `http://localhost:3000/auth/callback` and **Allowed Logout URL** to `http://localhost:3000`.

### 4. Set up the database

In your Supabase project, open the **SQL Editor** and run the migration scripts to create the required tables:

- `users` — user profiles, XP, rank, streak, friend codes, avatars
- `friendships` — bidirectional friend graph
- `squads` + `squad_members` — group system, capped at 4 members per squad
- `squad_quests` + `squad_quest_completions` — group quest system
- `events` + `event_participants` — limited-time challenges

Then create a public **Storage bucket** named `avatars` for custom uploads.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Ascend login gate. Sign up with Auth0 and you're in.

---

## What to look at during the demo

1. **Home screen** — Hero rank ring with progress, weekly streak grid, quick action cards
2. **Live tab** — 4 sub-tabs: Events, Activity feed, Friends ladder, Global leaderboard
3. **Friends tab** — Friend code system, demo friends already loaded (Gavin/Ashish/Josh), squad system
4. **Profile tab** — Custom avatar picker, glowing earned event tags, streak multiplier card, working settings modals
5. **Coach tab** — AI chatbot with quick-prompt starters, suggests quests with one-tap adopt
6. **Quests tab** — Daily and weekly quests, AI verification flow

The desktop view shows three panels: admin dev console on the left (XP grants, rank jumps, push notification triggers), the iOS-styled phone in the center, and Ascend branding on the right.

---

## Demo friend codes

These users are hardcoded into the friends leaderboard so the demo is always populated:

| Name | Rank | XP | Code |
|---|---|---|---|
| Gavin Park | Gold | 1,700 | `GAVIN1` |
| Ashish Kumar | Legendary | 38,000 | `ASHIS1` |
| Josh Rivera | Grandmaster | 22,000 | `JOSHR1` |

You can also try the friend code system by adding any of these.

---

## Project structure

```
uwb-hacks-2026/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes (chatbot, quest verification)
│   ├── chatbot/            # AI coach page
│   ├── friends/            # Friends + squad page
│   ├── live/               # Events / activity / leaderboards
│   ├── profile/            # User profile + settings
│   ├── quests/             # Daily and weekly quest tracker
│   ├── globals.css         # Phone frame, animations, themes
│   ├── layout.tsx          # Root layout with admin/brand panels
│   └── page.tsx            # Home page
├── components/             # All React components
├── lib/                    # Auth0, Supabase, avatar helpers
├── proxy.ts                # Auth0 middleware
├── package.json
└── README.md
```

---

## Built by

- **Rafay Farah** — [@FreezeXero](https://github.com/FreezeXero)

University of Washington Bothell · UWB Hacks 2026

---

## License

This project is for the UWB Hacks 2026 submission and is not licensed for redistribution.
