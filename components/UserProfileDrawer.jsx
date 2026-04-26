"use client";

import { useEffect } from "react";
import { X, Flame, Trophy, Target, UserPlus, Bell, Crown, Check } from "lucide-react";
import Avatar from "./Avatar";
import EventTag from "./EventTag";
import RankSymbol from "./RankSymbol";

const rankColors = {
  Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#fbbf24", Platinum: "#7dd3fc",
  Diamond: "#60a5fa", Champion: "#a78bfa", Grandmaster: "#f472b6", Legendary: "#fb923c",
  Surreal: "#ffffff",
};

// Demo data for hardcoded users — recent quests + tags
const DEMO_PROFILES = {
  "Gavin Park": {
    tags: [{ label: "April Grind", color: "#ff8a3d" }],
    streakDays: 9,
    recentQuests: [
      { title: "Leetcode 1 hour", xp: 150, when: "2h ago" },
      { title: "Gym session", xp: 138, when: "8h ago" },
      { title: "Read non-fiction 30 min", xp: 100, when: "yesterday" },
    ],
  },
  "Ashish Kumar": {
    tags: [
      { label: "47-Day Streak", color: "#ff8a3d" },
      { label: "Top 100 Global", color: "#fb923c" },
    ],
    streakDays: 47,
    recentQuests: [
      { title: "Side project 2 hours", xp: 560, when: "30m ago" },
      { title: "Gym 3x this week", xp: 500, when: "1h ago" },
      { title: "Sleep 8 hours", xp: 180, when: "today" },
    ],
  },
  "Josh Rivera": {
    tags: [
      { label: "Squad Wars Champion", color: "#a78bfa" },
      { label: "Hack Week '26", color: "#fbbf24" },
    ],
    streakDays: 23,
    recentQuests: [
      { title: "Study 45 minutes", xp: 150, when: "1h ago" },
      { title: "Gym session", xp: 165, when: "5h ago" },
      { title: "Finish a book", xp: 300, when: "2d ago" },
    ],
  },
};

// Default fallback for global users
const DEFAULT_PROFILE = {
  tags: [],
  streakDays: 0,
  recentQuests: [
    { title: "Leetcode 1 hour", xp: 120, when: "2h ago" },
    { title: "Gym session", xp: 110, when: "6h ago" },
    { title: "Read 30 min", xp: 80, when: "yesterday" },
  ],
};

export default function UserProfileDrawer({ user, isMe, onClose, onNudge, onAdd, isFriend }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!user) return null;

  const profile = DEMO_PROFILES[user.display_name] || DEFAULT_PROFILE;
  const rankColor = rankColors[user.rank] || rankColors.Bronze;
  const isSurreal = user.rank === "Surreal";
  const handle = user.display_name
    ? user.display_name.toLowerCase().replace(/\s+/g, "")
    : "player";

  return (
    <div
      className="absolute inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full overflow-hidden rounded-t-3xl border-t border-white/10 bg-[var(--surface-elevated)]"
        style={{
          maxHeight: "82%",
          background:
            "linear-gradient(180deg, var(--surface-elevated) 0%, var(--surface) 100%)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 hover:bg-white/[0.12] hover:text-white"
        >
          <X size={15} />
        </button>

        <div className="overflow-y-auto px-5 pb-6 pt-3" style={{ maxHeight: "calc(82vh - 20px)" }}>
          {/* Hero */}
          <div className="flex flex-col items-center pt-2">
            <Avatar
              displayName={user.display_name}
              avatarId={user.avatar_id}
              avatarUrl={user.avatar_url}
              rank={user.rank}
              size={84}
              glow
              surreal={isSurreal}
            />
            <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
              {isSurreal ? (
                <span className="surreal-text">{user.display_name}</span>
              ) : (
                user.display_name
              )}
            </h2>
            <p className="text-[12px] text-muted">@{handle}</p>

            {/* Tags */}
            {profile.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                {profile.tags.map((t) => (
                  <EventTag key={t.label} label={t.label} color={t.color} />
                ))}
              </div>
            )}
          </div>

          {/* Rank card */}
          <div
            className="mt-4 rounded-2xl border p-4"
            style={{
              borderColor: `${rankColor}33`,
              background: `linear-gradient(135deg, ${rankColor}24, ${rankColor}08, var(--surface))`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: `${rankColor}22`,
                  border: `1px solid ${rankColor}55`,
                }}
              >
                <RankSymbol rank={user.rank} size={26} color={rankColor} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Rank
                </p>
                <p
                  className="text-[20px] font-bold leading-tight"
                  style={{ color: rankColor }}
                >
                  {user.rank}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Total XP
                </p>
                <p className="text-[20px] font-bold tabular-nums leading-tight text-white">
                  {(user.xp || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Streak card */}
          <div
            className="mt-3 rounded-2xl border border-white/[0.08] p-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(255, 138, 61, 0.18) 0%, rgba(255, 138, 61, 0.04) 60%, var(--surface) 100%)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #ffa063, #ef6a1e)",
                  boxShadow: "0 0 16px rgba(255, 138, 61, 0.4)",
                }}
              >
                <Flame size={20} className="text-white" strokeWidth={2.4} fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Active Streak
                </p>
                <p className="text-[20px] font-bold leading-tight text-white">
                  {profile.streakDays} days
                </p>
              </div>
              {user.friend_code && (
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Friend Code
                  </p>
                  <p className="font-mono text-[14px] font-bold tracking-[0.18em] text-white">
                    {user.friend_code}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent quests */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <Trophy size={13} className="text-[var(--accent)]" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Recent Quests
              </p>
            </div>
            <div className="space-y-1.5">
              {profile.recentQuests.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                    <Check size={13} className="text-[var(--accent)]" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{q.title}</p>
                    <p className="text-[10px] text-muted">{q.when}</p>
                  </div>
                  <p className="text-[12px] font-bold text-[var(--accent)]">+{q.xp} XP</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {!isMe && (
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => onNudge?.(user)}
                className="future-button flex items-center justify-center gap-1.5 py-2.5 text-[13px]"
              >
                <Bell size={13} strokeWidth={2.4} />
                Nudge
              </button>
              {!isFriend && onAdd ? (
                <button
                  onClick={() => onAdd(user)}
                  className="future-button-ghost flex items-center justify-center gap-1.5 py-2.5 text-[13px]"
                >
                  <UserPlus size={13} strokeWidth={2.4} />
                  Add friend
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="future-button-ghost flex items-center justify-center gap-1.5 py-2.5 text-[13px]"
                >
                  Close
                </button>
              )}
            </div>
          )}
          {isMe && (
            <button
              onClick={onClose}
              className="future-button-ghost mt-5 w-full py-2.5 text-[13px]"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
