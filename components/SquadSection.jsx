"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, Users, Plus, LogOut, X, Crown } from "lucide-react";
import { supabase } from "../lib/supabase";

const rankColors = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#fbbf24",
  Platinum: "#7dd3fc",
  Diamond: "#60a5fa",
  Champion: "#a78bfa",
  Grandmaster: "#f472b6",
  Legendary: "#fb923c",
};

const MAX_SQUAD_SIZE = 4;

export default function SquadSection({ myUser, onChange }) {
  const [squad, setSquad] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadSquad = useCallback(async () => {
    if (!myUser?.id) return;

    const { data: membership } = await supabase
      .from("squad_members")
      .select("squad_id")
      .eq("user_id", myUser.id)
      .maybeSingle();

    if (!membership) {
      setSquad(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data: squadData } = await supabase
      .from("squads")
      .select("*")
      .eq("id", membership.squad_id)
      .single();

    if (!squadData) {
      setSquad(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data: memberRows } = await supabase
      .from("squad_members")
      .select("user_id, joined_at")
      .eq("squad_id", squadData.id);

    const memberIds = (memberRows || []).map((m) => m.user_id);

    if (memberIds.length === 0) {
      setSquad(squadData);
      setMembers([]);
      setLoading(false);
      return;
    }

    const { data: usersData } = await supabase
      .from("users")
      .select("id, display_name, xp, rank, friend_code")
      .in("id", memberIds);

    setSquad(squadData);
    setMembers(usersData || []);
    setLoading(false);
  }, [myUser?.id]);

  useEffect(() => {
    loadSquad();
  }, [loadSquad]);

  function copySquadCode() {
    if (!squad) return;
    navigator.clipboard.writeText(squad.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function leaveSquad() {
    if (!squad || !myUser) return;
    if (!confirm("Leave squad?")) return;

    await supabase
      .from("squad_members")
      .delete()
      .eq("squad_id", squad.id)
      .eq("user_id", myUser.id);

    if (squad.owner_id === myUser.id) {
      await supabase.from("squads").delete().eq("id", squad.id);
    }

    loadSquad();
    if (onChange) onChange();
  }

  if (loading) {
    return (
      <div className="future-panel flex items-center justify-center py-6">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--accent)]/30 border-t-[var(--accent)]" />
      </div>
    );
  }

  if (!squad) {
    return (
      <>
        <div className="future-panel-elevated p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <Users size={16} className="text-[var(--accent)]" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white">Join a squad</p>
              <p className="text-[11px] text-muted">
                Up to 4 people. Group quests, group XP.
              </p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="future-button px-3 py-2.5 text-[13px]"
            >
              Create squad
            </button>
            <button
              type="button"
              onClick={() => setShowJoin(true)}
              className="future-button-ghost px-3 py-2.5 text-[13px]"
            >
              Join with code
            </button>
          </div>
        </div>

        {showCreate && (
          <CreateSquadModal
            myUser={myUser}
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              loadSquad();
              if (onChange) onChange();
            }}
          />
        )}

        {showJoin && (
          <JoinSquadModal
            myUser={myUser}
            onClose={() => setShowJoin(false)}
            onJoined={() => {
              setShowJoin(false);
              loadSquad();
              if (onChange) onChange();
            }}
          />
        )}
      </>
    );
  }

  // In-squad view
  const sortedMembers = members.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const slotsUsed = members.length;

  return (
    <div className="future-panel-elevated p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <Users size={16} className="text-[var(--accent)]" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white">{squad.name}</p>
              <p className="text-[11px] text-muted">
                {slotsUsed} of {MAX_SQUAD_SIZE} members
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={leaveSquad}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.05] hover:text-red-400"
          aria-label="Leave squad"
        >
          <LogOut size={14} strokeWidth={2.2} />
        </button>
      </div>

      <button
        type="button"
        onClick={copySquadCode}
        className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition hover:border-white/15"
      >
        <div className="text-left">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
            Squad Code
          </p>
          <p className="mt-0.5 font-mono text-[15px] font-bold tracking-[0.2em] text-white">
            {squad.code}
          </p>
        </div>
        {copied ? (
          <Check size={15} className="text-emerald-400" strokeWidth={2.5} />
        ) : (
          <Copy size={14} className="text-zinc-400" strokeWidth={2} />
        )}
      </button>

      <div className="mt-3 space-y-1.5">
        {sortedMembers.map((m, idx) => {
          const rankColor = rankColors[m.rank] || rankColors.Bronze;
          const isOwner = m.id === squad.owner_id;
          const isMe = m.id === myUser?.id;
          const initials = (m.display_name || "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={m.id}
              className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                isMe
                  ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                  : "border-white/[0.05] bg-white/[0.02]"
              }`}
            >
              <span className="w-4 text-center text-[11px] font-bold text-muted">
                {idx + 1}
              </span>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${rankColor}, ${rankColor}99)`,
                }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-[13px] font-semibold text-white">
                    {m.display_name}
                  </p>
                  {isOwner && (
                    <Crown size={10} className="shrink-0 text-amber-400" strokeWidth={2.5} fill="currentColor" />
                  )}
                  {isMe && (
                    <span className="ml-0.5 shrink-0 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[8px] font-bold text-white">
                      YOU
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: rankColor }}
                >
                  {m.rank}
                </span>
              </div>
              <p className="text-[12px] font-bold tabular-nums text-white">
                {(m.xp || 0).toLocaleString()}
              </p>
            </div>
          );
        })}

        {/* Empty slots */}
        {Array.from({ length: MAX_SQUAD_SIZE - slotsUsed }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-2.5 rounded-lg border border-dashed border-white/[0.08] px-2.5 py-2"
          >
            <span className="w-4 text-center text-[11px] font-bold text-muted">
              {slotsUsed + i + 1}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-white/15">
              <Plus size={12} className="text-zinc-600" />
            </div>
            <p className="flex-1 text-[12px] text-muted">Open slot</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateSquadModal({ myUser, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate() {
    if (!name.trim() || creating || !myUser) return;
    setCreating(true);
    setError(null);

    const { data: newSquad, error: createError } = await supabase
      .from("squads")
      .insert({ name: name.trim(), owner_id: myUser.id })
      .select()
      .single();

    if (createError || !newSquad) {
      setError("Couldn't create squad");
      setCreating(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("squad_members")
      .insert({ squad_id: newSquad.id, user_id: myUser.id });

    setCreating(false);

    if (memberError) {
      setError("Couldn't add you to squad");
      return;
    }

    onCreated();
  }

  return (
    <ModalShell title="Create squad" onClose={onClose}>
      <p className="mt-1 text-[12px] text-muted">
        Pick a name. You'll get a 5-char code to share. Max 4 members.
      </p>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        maxLength={30}
        placeholder="Squad name"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
      />
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="future-button-ghost flex-1 py-2.5 text-[14px]">
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          className="future-button flex-1 py-2.5 text-[14px] disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>
    </ModalShell>
  );
}

function JoinSquadModal({ myUser, onClose, onJoined }) {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  async function handleJoin() {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode || joining || !myUser) return;
    setJoining(true);
    setError(null);

    const { data: targetSquad } = await supabase
      .from("squads")
      .select("id, name")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!targetSquad) {
      setError("Squad code not found");
      setJoining(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("squad_members")
      .insert({ squad_id: targetSquad.id, user_id: myUser.id });

    setJoining(false);

    if (insertError) {
      if (insertError.message?.includes("full")) {
        setError("That squad is full (4/4)");
      } else if (insertError.code === "23505") {
        setError("You're already in this squad");
      } else {
        setError("Couldn't join squad");
      }
      return;
    }

    onJoined();
  }

  return (
    <ModalShell title="Join squad" onClose={onClose}>
      <p className="mt-1 text-[12px] text-muted">Paste the 5-character squad code.</p>
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        maxLength={6}
        placeholder="HACK1"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-[16px] tracking-[0.2em] text-white placeholder:font-sans placeholder:text-[14px] placeholder:tracking-normal placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
      />
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="future-button-ghost flex-1 py-2.5 text-[14px]">
          Cancel
        </button>
        <button
          onClick={handleJoin}
          disabled={joining || !code.trim()}
          className="future-button flex-1 py-2.5 text-[14px] disabled:opacity-50"
        >
          {joining ? "Joining..." : "Join"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="future-panel-elevated w-full max-w-sm p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/[0.05] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
