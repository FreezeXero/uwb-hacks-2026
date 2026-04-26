Ascend

Discipline is a team sport.

A gamified accountability app where friends compete on streaks, AI verifies your quests, and squads lock in together. Built at UWB Hacks 2026.
What it does

AI-verified quests — Claude checks if you actually did the thing, not just clicked a box
9-rank ladder — Bronze → Silver → Gold → Platinum → Diamond → Champion → Grandmaster → Legendary → Surreal (top 3 global)
Streak multipliers — 1× to 2× XP boosts that scale with your active streak
Squads of 4 — group quests where all members must complete or no bonus drops
Live events — limited-time challenges with multiplied XP (Hack Week, April Grind, Squad Wars)
AI coach — Claude-powered chatbot that personalizes quest suggestions to your goals
Global leaderboard — compete with the world, top 3 earn the white-glow Surreal rank

Tech stack

Next.js 16 (App Router) + React 19 + TypeScript
Tailwind CSS
Auth0 for authentication
Supabase (PostgreSQL) for data
Anthropic Claude API (Sonnet 4.5) for AI verification + chatbot
DiceBear for generated avatars
Lucide for icons

Getting started
Install dependencies:
bashnpm install
Set up environment variables. Create a .env.local file in the project root with:
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Auth0
AUTH0_SECRET=                 # generate with: openssl rand -hex 32
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
APP_BASE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
Run the dev server:
bashnpm run dev
Open http://localhost:3000 in your browser.
Database setup
Ascend uses Supabase. The schema includes users, friendships, squads, squad_members, squad_quests, squad_quest_completions, events, and event_participants tables, plus a public avatars storage bucket for custom profile pictures.
SQL migration scripts are in the project history — run them in the Supabase SQL editor before first launch.
Demo notes
The desktop view shows three panels:

Left — admin dev console (only visible at 1100px+ viewport) for granting XP, jumping ranks, triggering rank-up celebrations, and firing push notifications
Center — the iOS-styled phone running the actual app
Right — Ascend branding

Demo friend codes (hardcoded for the demo): GAVIN1, ASHIS1, JOSHR1.
Pitch
Existing habit trackers can't tell if you actually did anything — they're checkbox apps. Ascend uses Claude to verify each quest with a quick conversational check. Squads lock all four members in: if anyone flakes, nobody gets the bonus. Events make it a live game, not a static checklist.
Contributors

Rafay Farah
Ashis Adhikari
Gavin Feng
Joshua Eunyul Bae

License
Built for UWB Hacks 2026. Not licensed for redistribution.
