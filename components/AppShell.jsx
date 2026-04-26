"use client";

import MobileNav from "./MobileNav";
import RankSymbol from "./RankSymbol";
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
    <header className="px-5 pb-3 pt-12 sm:pt-14">
      <h1 className="text-[22px] font-bold tracking-tight text-white">{title}</h1>
      {subtitle ? <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p> : null}
    </header>
  );
}

function RankHeader() {
  const { xp, rank, rankColor, nextRankName, xpToNext, progressPct } = useAppState();
  // Long rank names get smaller font
  const isLongRank = rank.length > 8;

  return (
    <header className="px-5 pb-4 pt-12 sm:pt-14">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: `${rankColor}22`,
              border: `1px solid ${rankColor}44`,
            }}
          >
            <RankSymbol rank={rank} size={24} color={rankColor} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              Current Rank
            </p>
            <p
              className={`mt-0.5 truncate font-bold tracking-tight ${
                isLongRank ? "text-[20px]" : "text-[24px]"
              }`}
              style={{ color: rankColor }}
            >
              {rank}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[22px] font-bold tabular-nums leading-none text-white">
            {xp.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Total XP
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: rankColor }}
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
