"use client";

import MobileNav from "./MobileNav";
import { useAppState } from "./AppStateProvider";

function getRankAccent(rank) {
  if (rank === "Bronze") {
    return "from-amber-500 via-amber-600 to-amber-700";
  }
  if (rank === "Silver") {
    return "from-zinc-300 via-zinc-400 to-zinc-500";
  }
  if (rank === "Diamond") {
    return "from-sky-400 via-cyan-500 to-blue-500";
  }
  if (rank === "Champion") {
    return "from-violet-400 via-purple-500 to-fuchsia-500";
  }
  if (rank === "Grand Champion") {
    return "from-rose-500 via-red-600 to-red-700";
  }
  return "from-white via-zinc-100 to-zinc-200";
}

export default function AppShell({
  title,
  subtitle,
  children,
  headerVariant = "standard",
}) {
  const { xp, rank, rankConfig } = useAppState();
  const currentRankIndex = rankConfig.findIndex((item) => item.name === rank);
  const nextRank = rankConfig[Math.min(currentRankIndex + 1, rankConfig.length - 1)];
  const currentRankXpFloor = rankConfig[currentRankIndex]?.minXp ?? 0;
  const nextRankXpFloor = nextRank?.minXp ?? currentRankXpFloor;
  const xpIntoTier = Math.max(0, xp - currentRankXpFloor);
  const tierSpan = Math.max(1, nextRankXpFloor - currentRankXpFloor);
  const progressPercent =
    currentRankIndex === rankConfig.length - 1
      ? 100
      : Math.min(100, Math.round((xpIntoTier / tierSpan) * 100));
  const xpToNext =
    currentRankIndex === rankConfig.length - 1 ? 0 : Math.max(0, nextRankXpFloor - xp);
  const rankAccent = getRankAccent(rank);

  return (
    <div className="min-h-screen bg-transparent px-3 py-4 text-white">
      <main className="mx-auto flex h-[calc(100dvh-2rem)] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1117] shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
        {headerVariant === "rank" ? (
          <header className="relative border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] px-5 py-4">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-400/15 blur-2xl" />
            <div className="pointer-events-none absolute -left-6 bottom-0 h-16 w-16 rounded-full bg-cyan-300/10 blur-xl" />

            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Rank Progress
              </p>
              <p className="text-xs text-muted">{xp} XP</p>
            </div>

            <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{rank}</p>
                <p className="text-xs text-muted">
                {currentRankIndex === rankConfig.length - 1
                  ? "Max rank reached"
                  : `${xpToNext} XP to ${nextRank.name}`}
              </p>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${rankAccent} transition-all duration-500`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted">
              {title} {subtitle ? `• ${subtitle}` : ""}
            </p>
          </header>
        ) : (
          <header className="relative border-b border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] px-5 py-4">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-400/15 blur-2xl" />
            <div className="pointer-events-none absolute -left-6 bottom-0 h-16 w-16 rounded-full bg-cyan-300/10 blur-xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              StreakCard
            </p>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </header>
        )}

        <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</section>

        <MobileNav />
      </main>
    </div>
  );
}
