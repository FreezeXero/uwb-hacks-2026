export default function LoginGate() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo / brand */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/40 bg-orange-500/10 text-3xl shadow-[0_0_40px_rgba(251,146,60,0.25)]">
            🔥
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            StreakCard
          </h1>
          <p className="mt-2 text-sm text-muted">
            AI-verified accountability. Real productivity, gamified.
          </p>
        </div>

        {/* Card with auth buttons */}
        <div className="future-panel rounded-2xl p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Get Started
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">
            Build streaks that actually mean something
          </h2>
          <p className="mt-2 text-sm text-muted">
            Set quests, log progress, rank up from Bronze to Legendary. Our AI coach makes sure you actually did the work.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <a
              href="/auth/login?screen_hint=signup"
              className="future-button block w-full px-4 py-3 text-center text-sm"
            >
              Sign Up Free
            </a>
            <a
              href="/auth/login"
              className="future-button-ghost block w-full px-4 py-3 text-center text-sm"
            >
              Log In
            </a>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs">
              🤖
            </span>
            <span>AI verifies every quest you log</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs">
              🏆
            </span>
            <span>8 ranks from Bronze to Legendary</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs">
              ⚔️
            </span>
            <span>Compete with friends on the leaderboard</span>
          </div>
        </div>
      </div>
    </main>
  );
}
