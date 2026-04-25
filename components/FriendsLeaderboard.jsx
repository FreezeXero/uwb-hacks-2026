"use client";

import { useEffect, useState } from "react";
import { useAppState } from "./AppStateProvider";
import { supabase } from "../lib/supabase";

const rankColors = {
  Bronze: { color: "#cd7f32", glow: "rgba(205, 127, 50, 0.4)" },
  Silver: { color: "#c0c0c0", glow: "rgba(192, 192, 192, 0.4)" },
  Gold: { color: "#fbbf24", glow: "rgba(251, 191, 36, 0.4)" },
  Platinum: { color: "#7dd3fc", glow: "rgba(125, 211, 252, 0.4)" },
  Diamond: { color: "#60a5fa", glow: "rgba(96, 165, 250, 0.5)" },
  Champion: { color: "#a78bfa", glow: "rgba(167, 139, 250, 0.5)" },
  Grandmaster: { color: "#f472b6", glow: "rgba(244, 114, 182, 0.5)" },
  Legendary: { color: "#fb923c", glow: "rgba(251, 146, 60, 0.6)" },
};

export default function FriendsLeaderboard() {
  const { auth0Id } = useAppState();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await supabase
        .from("users")
        .select("id, auth0_id, display_name, xp, rank")
        .order("xp", { ascending: false })
        .limit(25);

      if (!mounted) return;

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setUsers(data || []);
      setLoading(false);
    }

    load();

    // Refresh every 5 seconds so XP changes show up live
    const interval = setInterval(load, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="future-panel rounded-2xl p-4">
        <p className="text-sm text-red-400">Couldn&apos;t load leaderboard</p>
        <p className="mt-1 text-xs text-muted">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="future-panel rounded-2xl p-6 text-center">
        <p className="text-base font-semibold text-white">No players yet</p>
        <p className="mt-2 text-sm text-muted">
          Invite friends to start competing for the top of the ladder.
        </p>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="space-y-4">
      {/* Top 3 podium */}
      {topThree.length > 0 && (
        <div className="future-panel rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Top Players
          </p>
          <div className="mt-3 space-y-2.5">
            {topThree.map((user, idx) => {
              const isMe = user.auth0_id === auth0Id;
              const rankInfo = rankColors[user.rank] || rankColors.Bronze;
              const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
                  style={{
                    boxShadow: idx === 0 ? `0 0 24px -8px ${rankInfo.glow}` : "none",
                  }}
                >
                  <span className="text-2xl">{medal}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-white">
                        {user.display_name}
                      </p>
                      {isMe && (
                        <span className="shrink-0 rounded-full border border-orange-500/40 bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold text-orange-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{
                          color: rankInfo.color,
                          textShadow: `0 0 8px ${rankInfo.glow}`,
                        }}
                      >
                        {user.rank}
                      </span>
                      <span className="text-[11px] text-muted">
                        {(user.xp || 0).toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of leaderboard */}
      {rest.length > 0 && (
        <div className="future-panel rounded-2xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Ladder
          </p>
          <div className="mt-3 space-y-1.5">
            {rest.map((user, idx) => {
              const position = idx + 4;
              const isMe = user.auth0_id === auth0Id;
              const rankInfo = rankColors[user.rank] || rankColors.Bronze;

              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 rounded-lg p-2.5 ${
                    isMe ? "border border-orange-500/30 bg-orange-500/5" : ""
                  }`}
                >
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-muted">
                    #{position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.display_name}
                      </p>
                      {isMe && (
                        <span className="shrink-0 rounded-full border border-orange-500/40 bg-orange-500/15 px-1.5 py-0.5 text-[9px] font-bold text-orange-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: rankInfo.color,
                        textShadow: `0 0 6px ${rankInfo.glow}`,
                      }}
                    >
                      {user.rank}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-orange-400">
                    {(user.xp || 0).toLocaleString()} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
