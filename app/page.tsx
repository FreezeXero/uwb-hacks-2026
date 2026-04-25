import AppShell from "../components/AppShell";

export default function Home() {
  return (
    <AppShell title="Home" subtitle="City 2070 command center" headerVariant="rank">
      <section className="space-y-3">
        <div className="future-panel rounded-2xl bg-gradient-to-r from-amber-50 to-zinc-100 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            🏙️ Night Grid Status
          </p>
          <p className="mt-2 text-3xl font-bold text-white">19 Day Streak</p>
          <p className="mt-1 text-sm text-muted">Powering up toward Level 13</p>
        </div>

        <div className="future-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-white">⚡ Today&apos;s Mission</p>
          <p className="mt-1 text-sm text-muted">
            Complete all active quests to keep your reactor stable.
          </p>
        </div>

        <div className="future-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-white">🚀 Quick Actions</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" className="future-button px-3 py-2 text-xs">
              Log progress
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-muted shadow-[0_6px_14px_rgba(0,0,0,0.12)]"
            >
              Open robot coach
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
