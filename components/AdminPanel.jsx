"use client";

import { useState } from "react";
import { Activity, Bell, RotateCcw, Trophy } from "lucide-react";
import { useAppState } from "./AppStateProvider";

const ranks = [
  { name: "Bronze", minXp: 0, color: "#cd7f32" },
  { name: "Silver", minXp: 500, color: "#c0c0c0" },
  { name: "Gold", minXp: 1500, color: "#fbbf24" },
  { name: "Platinum", minXp: 3500, color: "#7dd3fc" },
  { name: "Diamond", minXp: 7000, color: "#60a5fa" },
  { name: "Champion", minXp: 12000, color: "#a78bfa" },
  { name: "Grandmaster", minXp: 20000, color: "#f472b6" },
  { name: "Legendary", minXp: 35000, color: "#fb923c" },
];

const NOTIF_PRESETS = [
  {
    label: "Streak risk",
    title: "🔥 Don't break the streak",
    body: "You'll lose your 8-day streak in 3 hours. Knock out a quest now.",
  },
  {
    label: "Friend nudge",
    title: "Gavin nudged you",
    body: "Catch up — Gavin just hit a 9-day streak. You got this.",
  },
  {
    label: "Reminder",
    title: "Daily quest waiting",
    body: "Don't forget Leetcode 1hr today. +150 XP with your boost.",
  },
  {
    label: "Squad alert",
    title: "Squad quest 1 day left",
    body: "Hack Squad needs you — only you haven't completed the weekly quest.",
  },
];

export default function AdminPanel() {
  const { xp, rank, addXp, setXpDirect, pushNotification } = useAppState();
  const [customNotif, setCustomNotif] = useState("");

  function fireNotif(preset) {
    pushNotification({ title: preset.title, body: preset.body });
  }

  function fireCustomNotif() {
    const text = customNotif.trim();
    if (!text) return;
    pushNotification({ title: "Ascend", body: text });
    setCustomNotif("");
  }

  return (
    <aside className="admin-panel">
      <div className="flex items-center gap-2 pb-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20">
          <Activity size={14} className="text-emerald-400" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Dev Console
          </p>
          <p className="text-[10px] text-zinc-500">Demo controls only</p>
        </div>
      </div>

      <div className="divider-soft" />

      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">XP</span>
          <span className="text-[12px] font-bold tabular-nums text-white">
            {xp.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Rank</span>
          <span className="text-[12px] font-bold text-white">{rank}</span>
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Grant XP
        </p>
        <div className="grid grid-cols-3 gap-1">
          {[50, 200, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => addXp(amt)}
              className="rounded-md border border-white/10 bg-white/[0.04] px-1 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/[0.08]"
            >
              +{amt}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Jump to rank
        </p>
        <div className="grid grid-cols-2 gap-1">
          {ranks.map((r) => (
            <button
              key={r.name}
              type="button"
              onClick={() => setXpDirect(r.minXp)}
              className={`rounded-md border px-1.5 py-1 text-[10px] font-semibold transition ${
                rank === r.name
                  ? "border-[var(--accent)]/50 bg-[var(--accent-soft)]"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
              }`}
              style={{ color: r.color }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          const currentIdx = ranks.findIndex((r) => r.name === rank);
          const nextRank = ranks[currentIdx + 1];
          if (!nextRank) {
            setXpDirect(0);
            setTimeout(() => setXpDirect(35000), 100);
            return;
          }
          setXpDirect(nextRank.minXp - 1);
          setTimeout(() => addXp(1), 150);
        }}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-2 text-[11px] font-bold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110"
      >
        <Trophy size={12} strokeWidth={2.5} />
        Trigger Rank Up
      </button>

      <div className="divider-soft" />

      {/* Notifications */}
      <div>
        <div className="mb-1 flex items-center gap-1.5">
          <Bell size={11} className="text-zinc-400" strokeWidth={2.4} />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Push notifications
          </p>
        </div>
        <div className="space-y-1">
          {NOTIF_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => fireNotif(p)}
              className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-left text-[11px] font-medium text-white transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-2">
          <input
            value={customNotif}
            onChange={(e) => setCustomNotif(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fireCustomNotif()}
            placeholder="Custom message..."
            className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[11px] text-white placeholder:text-zinc-600 focus:border-[var(--accent)]/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={fireCustomNotif}
            disabled={!customNotif.trim()}
            className="mt-1 w-full rounded-md bg-[var(--accent)] px-2 py-1.5 text-[11px] font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
          >
            Send custom notif
          </button>
        </div>
      </div>

      <div className="divider-soft" />

      <button
        type="button"
        onClick={() => {
          if (confirm("Reset XP to 0?")) setXpDirect(0);
        }}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-2 py-1.5 text-[11px] font-semibold text-red-400 transition hover:bg-red-500/10"
      >
        <RotateCcw size={11} strokeWidth={2.4} />
        Reset XP
      </button>

      <p className="mt-1 text-[9px] leading-tight text-zinc-600">
        Admin tools shown for demo. Hidden in production builds.
      </p>
    </aside>
  );
}
