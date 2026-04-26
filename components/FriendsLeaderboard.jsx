"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, UserPlus, Trophy, X as XIcon, Bell } from "lucide-react";
import { useAppState } from "./AppStateProvider";
import { supabase } from "../lib/supabase";
import SquadSection from "./SquadSection";
import Avatar from "./Avatar";

const rankColors = {
  Bronze: "#cd7f32", Silver: "#c0c0c0", Gold: "#fbbf24", Platinum: "#7dd3fc",
  Diamond: "#60a5fa", Champion: "#a78bfa", Grandmaster: "#f472b6", Legendary: "#fb923c",
  Surreal: "#ffffff",
};

const DEMO_FRIEND_CODES = ["GAVIN1", "ASHIS1", "JOSHR1"];

export default function FriendsLeaderboard() {
  const { auth0Id, pushNotification } = useAppState();
  const [me, setMe] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addStatus, setAddStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [seedAttempted, setSeedAttempted] = useState(false);

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
    if (friendIds.length === 0) { setFriends([]); setLoading(false); return; }

    const { data: friendsData } = await supabase
      .from("users").select("id, auth0_id, display_name, xp, rank, friend_code, avatar_id, avatar_url")
      .in("id", friendIds);
    setFriends(friendsData || []);
    setLoading(false);
  }, [auth0Id]);

  useEffect(() => {
    if (!me || seedAttempted) return;
    setSeedAttempted(true);

    (async () => {
      const { data: demoUsers } = await supabase
        .from("users").select("id, friend_code").in("friend_code", DEMO_FRIEND_CODES);
      if (!demoUsers || demoUsers.length === 0) return;

      const demoUserIds = demoUsers.map((u) => u.id);
      const { data: existingFriendships } = await supabase
        .from("friendships").select("friend_id")
        .eq("user_id", me.id).in("friend_id", demoUserIds);

      const existingFriendIds = new Set((existingFriendships || []).map((f) => f.friend_id));
      const toAdd = demoUsers.filter((u) => !existingFriendIds.has(u.id));
      if (toAdd.length === 0) return;

      const rows = [];
      for (const u of toAdd) {
        rows.push({ user_id: me.id, friend_id: u.id });
        rows.push({ user_id: u.id, friend_id: me.id });
      }
      await supabase.from("friendships").upsert(rows, {
        onConflict: "user_id,friend_id", ignoreDuplicates: true,
      });
      loadData();
    })();
  }, [me, seedAttempted, loadData]);

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
    if (code === me.friend_code) { setAddStatus({ type: "error", message: "That's your own code" }); return; }
    setAdding(true); setAddStatus(null);
    const { data: targetUser } = await supabase
      .from("users").select("id, display_name").eq("friend_code", code).maybeSingle();
    if (!targetUser) {
      setAddStatus({ type: "error", message: "Friend code not found" });
      setAdding(false); return;
    }
    const { error: insertError } = await supabase.from("friendships").upsert(
      [{ user_id: me.id, friend_id: targetUser.id }, { user_id: targetUser.id, friend_id: me.id }],
      { onConflict: "user_id,friend_id", ignoreDuplicates: true },
    );
    if (insertError) setAddStatus({ type: "error", message: "Couldn't add friend" });
    else {
      setAddStatus({ type: "success", message: `Added ${targetUser.display_name}` });
      setCodeInput(""); loadData();
    }
    setAdding(false);
    setTimeout(() => setAddStatus(null), 2500);
  }

  async function removeFriend(friendId) {
    if (!me) return;
    await supabase.from("friendships").delete().or(
      `and(user_id.eq.${me.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${me.id})`,
    );
    loadData();
  }

  function nudgeFriend(friend) {
    pushNotification({
      title: `You nudged ${friend.display_name}`,
      body: `They'll get pinged to lock in. Don't let ${friend.display_name.split(" ")[0]} pull ahead.`,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
      </div>
    );
  }

  const everyone = me ? [me, ...friends] : friends;
  const sorted = everyone.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));

  return (
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
        {sorted.length === 0 ? (
          <div className="future-panel p-6 text-center">
            <p className="text-[14px] font-semibold text-white">No friends yet</p>
            <p className="mt-1 text-[12px] text-muted">Add a friend code above to start competing</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sorted.map((user, idx) => {
              const isMe = user.id === me?.id;
              const rankColor = rankColors[user.rank] || rankColors.Bronze;
              return (
                <div
                  key={user.id}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                    isMe ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]" : "border-white/[0.06] bg-[var(--surface)]"
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
                  {!isMe && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => nudgeFriend(user)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] transition hover:brightness-110"
                        aria-label="Nudge" title="Nudge"
                      >
                        <Bell size={12} strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={() => removeFriend(user.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/[0.05] hover:text-red-400"
                        aria-label="Remove"
                      >
                        <XIcon size={12} strokeWidth={2.2} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
