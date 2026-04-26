"use client";

import Link from "next/link";
import { Flame, Target, Sparkles, Trophy, ChevronRight } from "lucide-react";
import { useAppState } from "../components/AppStateProvider";
import AppShell from "../components/AppShell";

export default function Home() {
  const {
    quests,
    displayName,
    xp,
    rank,
    rankColor,
    nextRankName,
    xpToNext,
    progressPct,
  } = useAppState();

  const dailyQuests = quests.filter((q) => q.cadence === "daily");
  const completedToday = dailyQuests.filter((q) => q.done).length;
  const totalToday = dailyQuests.length;
  const remainingXP = dailyQuests
    .filter((q) => !q.done)
    .reduce((sum, q) => sum + q.xp, 0);

  const firstName = displayName ? displayName.split(" ")[0] : "there";

  // Mock 7-day streak data; in production this comes from quest history
  const last7Days = [1, 1, 1, 0, 1, 1, 1];

  return (
    <AppShell title={`Hey ${firstName}.`} subtitle={
      completedToday === totalToday && totalToday > 0
        ? "Daily quests cleared. Locked in."
        : `${totalToday - completedToday} quests left today.`
    }>
      <div className="space-y-3">
        {/* HERO: Rank ring card with rank-color gradient bg */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-5"
          style={{
            background: `
              radial-gradient(ellipse at 80% 0%, ${rankColor}28, transparent 55%),
              radial-gradient(ellipse at 20% 100%, ${rankColor}14, transparent 55%),
              var(--surface)
            `,
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.04),
              0 4px 20px ${rankColor}18
            `,
          }}
        >
          <div className="flex items-center gap-4">
            <RankRing color={rankColor} progressPct={progressPct} rank={rank} />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Current Rank
              </p>
              <p
                className="mt-1 text-[24px] font-bold tracking-tight"
                style={{ color: rankColor }}
              >
                {rank}
              </p>
              <p className="mt-0.5 text-[12px] text-muted">
                {nextRankName
                  ? `${xpToNext.toLocaleString()} XP to ${nextRankName}`
                  : "Max rank reached"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <MiniStat label="XP" value={xp.toLocaleString()} />
                <MiniStat label="Streak" value="8d" />
              </div>
            </div>
          </div>
        </div>

        {/* This week strip */}
        <div className="future-panel p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--warm-soft)]">
                <Flame size={16} className="text-[var(--warm)]" strokeWidth={2.2} />
              </div>
              <p className="text-[13px] font-semibold text-white">This week</p>
            </div>
            <p className="text-[11px] text-muted">Last 7 days</p>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {last7Days.map((completed, i) => (
              <div
                key={i}
                className="aspect-square rounded-md transition-all"
                style={{
                  background: completed
                    ? "linear-gradient(135deg, var(--warm) 0%, #ef6a1e 100%)"
                    : "rgba(255,255,255,0.05)",
                  boxShadow: completed
                    ? "0 0 12px var(--warm-glow), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "inset 0 1px 0 rgba(255,255,255,0.02)",
                }}
              />
            ))}
          </div>

          <p className="mt-3 text-[11px] text-muted">
            {totalToday > 0
              ? `Today: ${completedToday}/${totalToday} quests · +${remainingXP} XP available`
              : "No quests yet today"}
          </p>
        </div>

        {/* Quick actions 2-col */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/quests"
            className="future-panel flex flex-col gap-2.5 p-4 transition hover:border-white/15"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <Target size={18} className="text-[var(--accent)]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Log a quest</p>
              <p className="text-[11px] text-muted">Verify with AI</p>
            </div>
          </Link>

          <Link
            href="/chatbot"
            className="future-panel flex flex-col gap-2.5 p-4 transition hover:border-white/15"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <Sparkles size={18} className="text-[var(--accent)]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Ask coach</p>
              <p className="text-[11px] text-muted">Get suggestions</p>
            </div>
          </Link>
        </div>

        {/* Friends CTA */}
        <Link
          href="/friends"
          className="future-panel flex items-center justify-between p-4 transition hover:border-white/15"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <Trophy size={18} className="text-[var(--accent)]" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Compete</p>
              <p className="text-[11px] text-muted">See the friends leaderboard</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-zinc-500" />
        </Link>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/[0.04] px-2 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="text-[14px] font-bold tracking-tight text-white">{value}</p>
    </div>
  );
}

function RankRing({ color, progressPct, rank }) {
  const size = 110;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPct / 100) * circumference;
  const initials = (rank || "??").slice(0, 2).toUpperCase();

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Soft glow halo behind ring */}
        <defs>
          <radialGradient id={`ring-glow-${rank}`}>
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="60%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 2}
          fill={`url(#ring-glow-${rank})`}
        />

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          fill="none"
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter: `drop-shadow(0 0 8px ${color}80)`,
            transition: "stroke-dashoffset 1.2s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p
          className="text-[26px] font-bold leading-none tracking-tight"
          style={{
            color,
            textShadow: `0 0 18px ${color}90`,
          }}
        >
          {initials}
        </p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
          {Math.round(progressPct)}%
        </p>
      </div>
    </div>
  );
}
