"use client";

import MobileNav from "./MobileNav";
import { useAppState } from "./AppStateProvider";

export default function AppShell({
  title,
  subtitle,
  children,
  headerVariant = "standard",
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--background)] text-white">
      {headerVariant === "rank" ? (
        <RankHeader />
      ) : (
        <StandardHeader title={title} subtitle={subtitle} />
      )}

      <section className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-3">
        {children}
      </section>

      <MobileNav />
    </div>
  );
}

function StandardHeader({ title, subtitle }) {
  return (
    <header className="px-5 pb-3 pt-12 sm:pt-11">
      <h1 className="text-[22px] font-bold tracking-tight text-white">{title}</h1>
      {subtitle ? <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p> : null}
    </header>
  );
}

function RankHeader() {
  const { xp, rank, rankColor, nextRankName, xpToNext, progressPct } = useAppState();

  return (
    <header className="px-5 pb-4 pt-12 sm:pt-11">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Current Rank
          </p>
          <p
            className="mt-1 text-[26px] font-bold tracking-tight"
            style={{ color: rankColor }}
          >
            {rank}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[24px] font-bold tabular-nums text-white">
            {xp.toLocaleString()}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Total XP
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: rankColor,
          }}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-muted">
        {nextRankName
          ? `${xpToNext.toLocaleString()} XP to ${nextRankName}`
          : "Max rank reached"}
      </p>
    </header>
  );
}
