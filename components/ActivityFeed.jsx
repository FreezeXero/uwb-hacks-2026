"use client";

import { useEffect, useState } from "react";
import { Flame, Trophy, Target, Sparkles, TrendingUp, UserPlus } from "lucide-react";

const ICONS = {
  rankup: Trophy,
  quest: Target,
  streak: Flame,
  squad: Sparkles,
  level: TrendingUp,
  friend: UserPlus,
};

const TINTS = {
  rankup: "#fbbf24",
  quest: "#4f8cff",
  streak: "#ff8a3d",
  squad: "#a78bfa",
  level: "#10b981",
  friend: "#60a5fa",
};

const SEED_EVENTS = [
  { type: "rankup", actor: "Ashish Kumar", text: "hit Legendary", detail: "47-day streak", minutesAgo: 5 },
  { type: "quest", actor: "Gavin Park", text: "completed Leetcode 1hr", detail: "+150 XP", minutesAgo: 12 },
  { type: "streak", actor: "Gavin Park", text: "is on a 9-day streak", detail: "1.25× XP active", minutesAgo: 28 },
  { type: "squad", actor: "Hack Squad", text: "all cleared their group quest", detail: "+1.5× bonus paid", minutesAgo: 60 },
  { type: "rankup", actor: "Josh Rivera", text: "hit Grandmaster", detail: "23-day streak", minutesAgo: 90 },
  { type: "quest", actor: "Josh Rivera", text: "completed Gym 3x this week", detail: "+312 XP", minutesAgo: 120 },
  { type: "friend", actor: "Ashish Kumar", text: "added you as a friend", detail: "Say hi", minutesAgo: 180 },
  { type: "streak", actor: "You", text: "are on an 8-day streak", detail: "5 more days for 1.5×", minutesAgo: 240 },
  { type: "level", actor: "Gavin Park", text: "earned 500 XP today", detail: "Top performer", minutesAgo: 300 },
];

function timeAgo(minutesAgo) {
  if (minutesAgo < 1) return "just now";
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityFeed({ expanded = false }) {
  const [events, setEvents] = useState(SEED_EVENTS);

  useEffect(() => {
    const tick = setInterval(() => {
      setEvents((prev) => prev.map((e) => ({ ...e, minutesAgo: e.minutesAgo + 1 })));
    }, 60000);
    return () => clearInterval(tick);
  }, []);

  const limit = expanded ? 9 : 4;

  return (
    <div className="future-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </span>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">Live activity</p>
            <p className="text-[10px] text-muted">Your friends right now</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {events.slice(0, limit).map((event, i) => {
          const Icon = ICONS[event.type] || Sparkles;
          const tint = TINTS[event.type] || "#4f8cff";
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-2.5"
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${tint}1f`, border: `1px solid ${tint}33` }}
              >
                <Icon size={13} style={{ color: tint }} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] leading-snug text-white">
                  <span className="font-semibold">{event.actor}</span>{" "}
                  <span className="text-zinc-300">{event.text}</span>
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold" style={{ color: tint }}>
                    {event.detail}
                  </span>
                  <span className="text-[10px] text-zinc-500">·</span>
                  <span className="text-[10px] text-zinc-500">{timeAgo(event.minutesAgo)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
