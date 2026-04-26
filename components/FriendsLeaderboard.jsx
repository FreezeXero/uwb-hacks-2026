"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, UserPlus, Trophy } from "lucide-react";
import { useAppState } from "./AppStateProvider";
import { supabase } from "../lib/supabase";
import SquadSection from "./SquadSection";
import Avatar from "./Avatar";
import UserProfileDrawer from "./UserProfileDrawer";

const rankColors = {
  Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#fbbf24", Platinum: "#7dd3fc",
  Diamond: "#60a5fa", Champion: "#a78bfa", Grandmaster: "#f472b6", Legendary: "#fb923c",
  Surreal: "#ffffff",
};

// HARDCODED demo friends - always show up regardless of DB state
const HARDCODED_FRIENDS = [
  {
    id: "demo-gavin",
    display_name: "Gavin Park",
    xp: 1700,
    rank: "Gold",
    friend_code: "GAVIN1",
    avatar_id: "auto",
    avatar_url: null,
  },
  {
    id: "demo-ashish",
    display_name: "Ashish Kumar",
    xp: 38000,
    rank: "Legendary",
    friend_code: "ASHIS1",
    avatar_id: "auto",
    avatar_url: null,
  },
  {
    id: "demo-josh",
    display_name: "Josh Rivera",
    xp: 22000,
    rank: "Grandmaster",
    friend_code: "JOSHR1",
    avatar_id: "auto",
    avatar_url: null,
  },
];

const HARDCODED_NAMES = new Set(HARDCODED_FRIENDS.map((f) => f.display_name));

export default function FriendsLeaderboard() {
  const { auth0Id, pushNotification } = useAppState();
  const [me, setMe] = useState(null);
  const [dbFriends, setDbFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addStatus, setAddStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [removed, setRemoved] = useState(new Set()); // track removed hardcoded friends per session

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

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  function copyMyCode() {
    if (!me?.friend_code) return;
    navigator.clipboard.writeText(me.friend_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleAddFriend() {
    const code = codeInput.trim().toUpperCase();
    if (!code || adding || !me) return;
    if (code === me.friend_code) {
      setAddStatus({ type: "error", message: "That's your own code" });
      return;
    }

    // Check if it's a hardcoded friend code being re-added
    const hardcodedMatch = HARDCODED_FRIENDS.find((f) => f.friend_code === code);
    if (hardcodedMatch) {
      // Re-add to visible list
      setRemoved((prev) => {
        const next = new Set(prev);
        next.delete(hardcodedMatch.id);
        return next;
      });
      setAddStatus({ type: "success", message: `Added ${hardcodedMatch.display_name}` });
      setCodeInput("");
      setTimeout(() => setAddStatus(null), 2500);
      return;
    }

    setAdding(true);
    setAddStatus(null);
    const { data: targetUser } = await supabase
      .from("users").select("id, display_name").eq("friend_code", code).maybeSingle();
    if (!targetUser) {
      setAddStatus({ type: "error", message: "Friend code not found" });
      setAdding(false);
      return;
    }
    const { error: insertError } = await supabase.from("friendships").upsert(
      [{ user_id: me.id, friend_id: targetUser.id }, { user_id: targetUser.id, friend_id: me.id }],
      { onConflict: "user_id,friend_id", ignoreDuplicates: true },
    );
    if (insertError) setAddStatus({ type: "error", message: "Couldn't add friend" });
    else {
      setAddStatus({ type: "success", message: `Added ${targetUser.display_name}` });
      setCodeInput("");
      loadData();
    }
    setAdding(false);
    setTimeout(() => setAddStatus(null), 2500);
  }

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

  // Build leaderboard: hardcoded (filtered for removed) + me + dbFriends (deduped against hardcoded names)
  const visibleHardcoded = HARDCODED_FRIENDS.filter((f) => !removed.has(f.id));
  const dedupedDbFriends = dbFriends.filter((f) => !HARDCODED_NAMES.has(f.display_name));
  const everyone = me
    ? [me, ...visibleHardcoded, ...dedupedDbFriends]
    : [...visibleHardcoded, ...dedupedDbFriends];
  const sorted = everyone.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
    <>
      <div className="space-y-4">
        <button onClick={copyMyCode} className="future-panel-elevated flex w-full items-center justify-between p-4">
          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Your Friend Code</p>
            <p className="mt-0.5 font-mono text-[20px] font-bold tracking-[0.2em] text-white">{me?.friend_code || "------"}</p>
            <p className="mt-0.5 text-[11px] text-muted">Share this so friends can add you</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06]">
            {copied ? <Check size={17} className="text-emerald-400" strokeWidth={2.5} /> : <Copy size={16} className="text-zinc-300" strokeWidth={2} />}
          </div>
        </button>

        <div className="future-panel p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Add a friend</p>
          <div className="mt-2 flex gap-2">
            <input
              value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleAddFriend()}
              placeholder="Enter friend code" maxLength={8}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-[14px] tracking-[0.18em] text-white placeholder:font-sans placeholder:text-[13px] placeholder:tracking-normal placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
            />
            <button onClick={handleAddFriend} disabled={adding || !codeInput.trim()}
              className="future-button flex shrink-0 items-center gap-1.5 px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-50">
              <UserPlus size={14} strokeWidth={2.4} /> Add
            </button>
          </div>
          {addStatus && (
            <p className={`mt-2 text-[12px] ${addStatus.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
              {addStatus.message}
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted">
            Try <span className="font-mono font-bold text-white">GAVIN1</span>{" "}
            <span className="font-mono font-bold text-white">ASHIS1</span>{" "}
            <span className="font-mono font-bold text-white">JOSHR1</span>
          </p>
        </div>

        <SquadSection myUser={me} onChange={loadData} />

        <div>
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <Trophy size={13} className="text-[var(--accent)]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Friends Leaderboard</p>
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
