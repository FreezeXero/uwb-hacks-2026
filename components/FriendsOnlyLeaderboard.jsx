"use client";

import { useCallback, useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useAppState } from "./AppStateProvider";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import UserProfileDrawer from "./UserProfileDrawer";

const rankColors = {
  Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#fbbf24", Platinum: "#7dd3fc",
  Diamond: "#60a5fa", Champion: "#a78bfa", Grandmaster: "#f472b6", Legendary: "#fb923c",
  Surreal: "#ffffff",
};

const HARDCODED_FRIENDS = [
  { id: "demo-gavin", display_name: "Gavin Park", xp: 1700, rank: "Gold", friend_code: "GAVIN1", avatar_id: "auto", avatar_url: null },
  { id: "demo-ashish", display_name: "Ashish Kumar", xp: 38000, rank: "Legendary", friend_code: "ASHIS1", avatar_id: "auto", avatar_url: null },
  { id: "demo-josh", display_name: "Josh Rivera", xp: 22000, rank: "Grandmaster", friend_code: "JOSHR1", avatar_id: "auto", avatar_url: null },
];

const HARDCODED_NAMES = new Set(HARDCODED_FRIENDS.map((f) => f.display_name));

export default function FriendsOnlyLeaderboard() {
  const { auth0Id, pushNotification } = useAppState();
  const [me, setMe] = useState(null);
  const [dbFriends, setDbFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = useCallback(async () => {
    if (!auth0Id) return;
    const { data: meData } = await supabase
      .from("users")
      .select("id, auth0_id, display_name, xp, rank, friend_code, avatar_id, avatar_url")
      .eq("auth0_id", auth0Id).single();
    if (!meData) { setLoading(false); return; }
    setMe(meData);

    const { data: friendships } = await supabase
      .from("friendships").select("friend_id").eq("user_id", meData.id);
    const friendIds = (friendships || []).map((f) => f.friend_id);
    if (friendIds.length === 0) { setDbFriends([]); setLoading(false); return; }

    const { data: friendsData } = await supabase
      .from("users").select("id, auth0_id, display_name, xp, rank, friend_code, avatar_id, avatar_url")
      .in("id", friendIds);
    setDbFriends(friendsData || []);
    setLoading(false);
  }, [auth0Id]);

  useEffect(() => { loadData(); }, [loadData]);

  function nudgeFriend(friend) {
    pushNotification({
      title: `You nudged ${friend.display_name}`,
      body: `They'll get pinged to lock in. Don't let ${friend.display_name.split(" ")[0]} pull ahead.`,
    });
    setSelectedUser(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
      </div>
    );
  }

  const dedupedDbFriends = dbFriends.filter((f) => !HARDCODED_NAMES.has(f.display_name));
  const everyone = me
    ? [me, ...HARDCODED_FRIENDS, ...dedupedDbFriends]
    : [...HARDCODED_FRIENDS, ...dedupedDbFriends];
  const sorted = everyone.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <>
      <div className="space-y-3">
        <div className="future-panel-elevated p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <Trophy size={16} className="text-[var(--accent)]" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Friends ladder</p>
              <p className="text-[11px] text-muted">Tap any friend to see their profile</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {sorted.map((user, idx) => {
            const isMe = user.id === me?.id;
            const rankColor = rankColors[user.rank] || rankColors.Bronze;
            return (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  isMe ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]" : "border-white/[0.06] bg-[var(--surface)] hover:border-white/15"
                }`}
              >
                <span className="w-5 shrink-0 text-center text-[12px] font-bold text-muted">{idx + 1}</span>
                <Avatar displayName={user.display_name} avatarId={user.avatar_id} avatarUrl={user.avatar_url} rank={user.rank} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[14px] font-semibold text-white">{user.display_name}</p>
                    {isMe && <span className="shrink-0 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[8px] font-bold text-white">YOU</span>}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: rankColor }}>
                    {user.rank}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold tabular-nums text-white">{(user.xp || 0).toLocaleString()}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted">XP</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedUser && (
        <UserProfileDrawer
          user={selectedUser}
          isMe={selectedUser.id === me?.id}
          isFriend={true}
          onClose={() => setSelectedUser(null)}
          onNudge={nudgeFriend}
        />
      )}
    </>
  );
}
