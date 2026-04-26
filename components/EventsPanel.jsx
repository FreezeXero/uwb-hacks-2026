"use client";

import { useEffect, useState } from "react";
import { Sparkles, Calendar, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAppState } from "./AppStateProvider";

// Hardcoded events keyed by current month — overrides anything in DB so the demo always feels fresh
const HARDCODED_EVENTS = [
  {
    id: "evt-uwb-hack-week",
    name: "UWB Hack Week",
    description: "Code through hack week. 1.5× XP on all focus quests. Top 3 get a permanent badge.",
    badge_emoji: "⚡",
    badge_color: "#fbbf24",
    xp_multiplier: 1.5,
    days_left: 5,
  },
  {
    id: "evt-april-grind",
    name: "April Grind",
    description: "Lock in for spring quarter. Complete 50 quests this month for the Grinder badge.",
    badge_emoji: "🔥",
    badge_color: "#ff8a3d",
    xp_multiplier: 1.25,
    days_left: 14,
  },
  {
    id: "evt-squad-wars",
    name: "Squad Wars",
    description: "Squads compete for total weekly XP. Winning squad gets a permanent crown.",
    badge_emoji: "👑",
    badge_color: "#a78bfa",
    xp_multiplier: 2.0,
    days_left: 7,
  },
];

export default function EventsPanel() {
  const { auth0Id } = useAppState();
  const [joined, setJoined] = useState(new Set());

  function toggleJoin(eventId) {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 px-1">
        <Calendar size={13} className="text-[var(--accent)]" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Limited Events
        </p>
      </div>
      <div className="space-y-2">
        {HARDCODED_EVENTS.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            joined={joined.has(event.id)}
            onJoin={() => toggleJoin(event.id)}
          />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event, joined, onJoin }) {
  const color = event.badge_color || "#fbbf24";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4"
      style={{
        borderColor: `${color}33`,
        background: `linear-gradient(135deg, ${color}24 0%, ${color}08 50%, var(--surface) 100%)`,
        boxShadow: `0 4px 20px ${color}18, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 20px ${color}66`,
          }}
        >
          {event.badge_emoji || "🎯"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
              Live event
            </p>
            <span className="text-[10px] text-muted">·</span>
            <p className="text-[10px] text-muted">{event.days_left}d left</p>
          </div>
          <p className="mt-0.5 text-[14px] font-bold text-white">{event.name}</p>
          <p className="mt-1 text-[11px] leading-snug text-muted">{event.description}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1">
          <Sparkles size={10} style={{ color }} strokeWidth={2.4} />
          <span className="text-[11px] font-semibold text-white">{event.xp_multiplier}× XP</span>
        </div>
        {joined ? (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-400">
            <Trophy size={10} strokeWidth={2.4} />
            Joined
          </div>
        ) : (
          <button
            onClick={onJoin}
            className="rounded-full px-4 py-1 text-[11px] font-bold text-white shadow-md transition hover:brightness-110"
            style={{
              background: `linear-gradient(180deg, ${color}, ${color}cc)`,
              boxShadow: `0 2px 8px ${color}55`,
            }}
          >
            Join event
          </button>
        )}
      </div>
    </div>
  );
}
