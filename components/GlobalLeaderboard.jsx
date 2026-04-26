"use client";

import { useEffect, useState } from "react";
import { Globe, Crown } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAppState } from "./AppStateProvider";
import Avatar from "./Avatar";

const rankColors = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#fbbf24",
  Platinum: "#7dd3fc",
  Diamond: "#60a5fa",
  Champion: "#a78bfa",
  Grandmaster: "#f472b6",
  Legendary: "#fb923c",
  Surreal: "#ffffff",
};

// Hardcoded global ladder - realistic-feeling names + ranks
const GLOBAL_USERS = [
  { name: "Kira Voss", xp: 142000, rank: "Surreal" },
  { name: "Mateo Aguilar", xp: 118500, rank: "Surreal" },
  { name: "Yuna Park", xp: 92300, rank: "Surreal" },
  { name: "Diego Salinas", xp: 58400, rank: "Legendary" },
  { name: "Priya Chandra", xp: 52100, rank: "Legendary" },
  { name: "Olivia Brooks", xp: 47800, rank: "Legendary" },
  { name: "Hiroshi Tanaka", xp: 41200, rank: "Legendary" },
  { name: "Zara Khan", xp: 38900, rank: "Legendary" },
  { name: "Liam O'Connor", xp: 36500, rank: "Legendary" },
  { name: "Ines Moreno", xp: 33700, rank: "Grandmaster" },
  { name: "Dimitri Volkov", xp: 31200, rank: "Grandmaster" },
  { name: "Sana Hoshino", xp: 29800, rank: "Grandmaster" },
  { name: "Karim Hassan", xp: 27400, rank: "Grandmaster" },
  { name: "Elena Vasquez", xp: 25900, rank: "Grandmaster" },
  { name: "Tobias Mueller", xp: 23100, rank: "Grandmaster" },
  { name: "Aria Bennett", xp: 20400, rank: "Grandmaster" },
  { name: "Felix Larsen", xp: 18700, rank: "Champion" },
  { name: "Naomi Reyes", xp: 17200, rank: "Champion" },
  { name: "Jaxon Whitaker", xp: 16100, rank: "Champion" },
  { name: "Mei Lin", xp: 15400, rank: "Champion" },
  { name: "Xander Rhys", xp: 14800, rank: "Champion" },
  { name: "Lila Sokolov", xp: 13900, rank: "Champion" },
  { name: "Owen Cassidy", xp: 13100, rank: "Champion" },
  { name: "Nia Okafor", xp: 12500, rank: "Champion" },
  { name: "Theo Bardem", xp: 11800, rank: "Diamond" },
  { name: "Roxy Aldrich", xp: 11200, rank: "Diamond" },
  { name: "Sasha Kim", xp: 10600, rank: "Diamond" },
  { name: "Bowen Ng", xp: 10100, rank: "Diamond" },
  { name: "Halle Brennan", xp: 9700, rank: "Diamond" },
  { name: "Cyrus Patel", xp: 9300, rank: "Diamond" },
  { name: "Imogen Rooke", xp: 8800, rank: "Diamond" },
  { name: "Knox Cheng", xp: 8400, rank: "Diamond" },
  { name: "Vera Halloran", xp: 7900, rank: "Diamond" },
  { name: "Reese Tanaka", xp: 7400, rank: "Diamond" },
  { name: "Quinn Mavros", xp: 7100, rank: "Diamond" },
];

export default function GlobalLeaderboard() {
  const { auth0Id, displayName, xp, rank, avatarId, avatarUrl } = useAppState();

  // Inject "you" into the right spot based on XP
  const allEntries = [...GLOBAL_USERS, { name: displayName, xp, rank, isMe: true, avatarId, avatarUrl }];
  const sorted = allEntries.sort((a, b) => b.xp - a.xp);

  // Find your position
  const myIndex = sorted.findIndex((u) => u.isMe);
  const myPosition = myIndex + 1;

  // Show top 20 + your row (if not already in top 20)
  const display = myIndex < 20 ? sorted.slice(0, 20) : [...sorted.slice(0, 18), sorted[myIndex]];

  return (
    <div className="space-y-3">
      <div className="future-panel-elevated p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
            <Globe size={16} className="text-[var(--accent)]" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white">Global ladder</p>
            <p className="text-[11px] text-muted">
              You're #{myPosition} of {GLOBAL_USERS.length + 1} this week
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {display.map((user) => {
          const idx = sorted.findIndex((u) => u === user);
          const position = idx + 1;
          const isMe = user.isMe;
          const isSurreal = user.rank === "Surreal";
          const rankColor = rankColors[user.rank] || rankColors.Bronze;
          const isTop3 = position <= 3;

          return (
            <div
              key={user.name + position}
              className="relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5"
              style={{
                borderColor: isSurreal
                  ? "rgba(255, 255, 255, 0.25)"
                  : isMe
                  ? "rgba(79, 140, 255, 0.3)"
                  : "rgba(255, 255, 255, 0.06)",
                background: isSurreal
                  ? "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, var(--surface) 100%)"
                  : isMe
                  ? "var(--accent-soft)"
                  : "var(--surface)",
                boxShadow: isSurreal
                  ? "inset 0 1px 0 rgba(255,255,255,0.10), 0 0 24px rgba(255,255,255,0.06)"
                  : undefined,
              }}
            >
              {/* Top-3 podium glow */}
              {isTop3 && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    background:
                      "radial-gradient(ellipse at left center, rgba(255,255,255,0.12), transparent 60%)",
                  }}
                />
              )}

              {/* Position number */}
              <div
                className={`relative z-10 w-7 shrink-0 text-center ${
                  isTop3
                    ? "text-[16px] font-black"
                    : "text-[12px] font-bold text-muted"
                }`}
                style={isTop3 ? { color: rankColor } : undefined}
              >
                {position === 1 && "🥇"}
                {position === 2 && "🥈"}
                {position === 3 && "🥉"}
                {position > 3 && `#${position}`}
              </div>

              <div className="relative z-10">
                <Avatar
                  displayName={user.name}
                  avatarId={isMe ? avatarId : "auto"}
                  avatarUrl={isMe ? avatarUrl : null}
                  rank={user.rank}
                  size={36}
                  surreal={isSurreal}
                />
              </div>

              <div className="relative z-10 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {isSurreal ? (
                    <p className="surreal-text truncate text-[14px] font-bold">
                      {user.name}
                    </p>
                  ) : (
                    <p className="truncate text-[14px] font-semibold text-white">
                      {user.name}
                    </p>
                  )}
                  {isMe && (
                    <span className="shrink-0 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[8px] font-bold text-white">
                      YOU
                    </span>
                  )}
                  {isSurreal && (
                    <Crown
                      size={11}
                      className="shrink-0 text-white"
                      strokeWidth={2.5}
                      fill="currentColor"
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
                    isSurreal ? "surreal-text" : ""
                  }`}
                  style={!isSurreal ? { color: rankColor } : undefined}
                >
                  {user.rank}
                </span>
              </div>

              <div className="relative z-10 text-right">
                <p className="text-[14px] font-bold tabular-nums text-white">
                  {(user.xp || 0).toLocaleString()}
                </p>
                <p className="text-[9px] uppercase tracking-wider text-muted">XP</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="pb-2 pt-1 text-center text-[11px] text-muted/70">
        Top 3 reach Surreal rank — only awarded to the global elite.
      </p>
    </div>
  );
}
