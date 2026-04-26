"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Copy, Check, Users, Plus, LogOut, X, Crown, Target, Trophy, Sparkles, UserPlus,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAppState } from "./AppStateProvider";
import Avatar from "./Avatar";

const MAX_SQUAD_SIZE = 4;
const DEMO_CODES = ["GAVIN1", "ASHIS1", "JOSHR1"];

export default function SquadSection({ myUser, onChange }) {
  const { addXp } = useAppState();
  const [squad, setSquad] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showAddDemo, setShowAddDemo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [groupQuest, setGroupQuest] = useState(null);
  const [completions, setCompletions] = useState([]);

  const loadSquad = useCallback(async () => {
    if (!myUser?.id) return;
    const { data: membership } = await supabase
      .from("squad_members").select("squad_id").eq("user_id", myUser.id).maybeSingle();

    if (!membership) {
      setSquad(null); setMembers([]); setGroupQuest(null); setCompletions([]); setLoading(false);
      return;
    }

    const { data: squadData } = await supabase
      .from("squads").select("*").eq("id", membership.squad_id).single();
    if (!squadData) { setSquad(null); setMembers([]); setLoading(false); return; }

    const { data: memberRows } = await supabase
      .from("squad_members").select("user_id").eq("squad_id", squadData.id);
    const memberIds = (memberRows || []).map((m) => m.user_id);

    let usersData = [];
    if (memberIds.length > 0) {
      const { data } = await supabase
        .from("users").select("id, display_name, xp, rank, friend_code, avatar_id, avatar_url")
        .in("id", memberIds);
      usersData = data || [];
    }

    const { data: questData } = await supabase
      .from("squad_quests").select("*").eq("squad_id", squadData.id)
      .gt("due_at", new Date().toISOString())
      .order("created_at", { ascending: false }).limit(1).maybeSingle();

    let completionData = [];
    if (questData) {
      const { data } = await supabase
        .from("squad_quest_completions").select("user_id").eq("squad_quest_id", questData.id);
      completionData = data || [];
    }

    setSquad(squadData);
    setMembers(usersData);
    setGroupQuest(questData);
    setCompletions(completionData);
    setLoading(false);
  }, [myUser?.id]);

  useEffect(() => {
    loadSquad();
    const t = setInterval(loadSquad, 8000);
    return () => clearInterval(t);
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
    await supabase.from("squad_members").delete().eq("squad_id", squad.id).eq("user_id", myUser.id);
    if (squad.owner_id === myUser.id) {
      await supabase.from("squads").delete().eq("id", squad.id);
    }
    loadSquad();
    onChange?.();
  }

  async function addDemoToSquad(code) {
    if (!squad) return;
    const { data: demoUser } = await supabase
      .from("users").select("id").eq("friend_code", code).maybeSingle();
    if (!demoUser) {
      alert("Demo user not found. Run the seed SQL.");
      return;
    }
    await supabase.from("squad_members").delete().eq("user_id", demoUser.id);
    await supabase.from("squad_members").insert({ squad_id: squad.id, user_id: demoUser.id });
    setShowAddDemo(false);
    loadSquad();
  }

  async function markGroupQuestDone() {
    if (!groupQuest || !myUser) return;
    if (completions.some((c) => c.user_id === myUser.id)) return;
    await supabase.from("squad_quest_completions").insert({
      squad_quest_id: groupQuest.id, user_id: myUser.id,
    });
    addXp(Math.round(groupQuest.xp_reward / Math.max(members.length, 1)));
    const newCount = completions.length + 1;
    if (newCount === members.length && members.length === MAX_SQUAD_SIZE) {
      addXp(Math.round((groupQuest.xp_reward * 0.5) / members.length));
    }
    loadSquad();
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
              <p className="text-[11px] text-muted">Up to 4 people. Group quests, group XP.</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={() => setShowCreate(true)} className="future-button px-3 py-2.5 text-[13px]">Create squad</button>
            <button onClick={() => setShowJoin(true)} className="future-button-ghost px-3 py-2.5 text-[13px]">Join with code</button>
          </div>
        </div>
        {showCreate && <CreateSquadModal myUser={myUser} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); loadSquad(); onChange?.(); }} />}
        {showJoin && <JoinSquadModal myUser={myUser} onClose={() => setShowJoin(false)} onJoined={() => { setShowJoin(false); loadSquad(); onChange?.(); }} />}
      </>
    );
  }

  const sortedMembers = members.slice().sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const slotsUsed = members.length;
  const myCompletion = completions.some((c) => c.user_id === myUser?.id);
  const allDone = members.length > 0 && completions.length === members.length;
  const memberIds = new Set(members.map((m) => m.id));

  return (
    <>
      <div className="future-panel-elevated p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                <Users size={16} className="text-[var(--accent)]" strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-white">{squad.name}</p>
                <p className="text-[11px] text-muted">{slotsUsed} of {MAX_SQUAD_SIZE} members</p>
              </div>
            </div>
          </div>
          <button onClick={leaveSquad} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.05] hover:text-red-400">
            <LogOut size={14} strokeWidth={2.2} />
          </button>
        </div>

        <button onClick={copySquadCode} className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 transition hover:border-white/15">
          <div className="text-left">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">Squad Code</p>
            <p className="mt-0.5 font-mono text-[15px] font-bold tracking-[0.2em] text-white">{squad.code}</p>
          </div>
          {copied ? <Check size={15} className="text-emerald-400" strokeWidth={2.5} /> : <Copy size={14} className="text-zinc-400" strokeWidth={2} />}
        </button>

        <div className="mt-3 space-y-1.5">
          {sortedMembers.map((m, idx) => {
            const isOwner = m.id === squad.owner_id;
            const isMe = m.id === myUser?.id;
            const memberDone = completions.some((c) => c.user_id === m.id);
            return (
              <div
                key={m.id}
                className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
                  isMe ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]" : "border-white/[0.05] bg-white/[0.02]"
                }`}
              >
                <span className="w-4 text-center text-[11px] font-bold text-muted">{idx + 1}</span>
                <Avatar displayName={m.display_name} avatarId={m.avatar_id} avatarUrl={m.avatar_url} rank={m.rank} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="truncate text-[13px] font-semibold text-white">{m.display_name}</p>
                    {isOwner && <Crown size={10} className="shrink-0 text-amber-400" strokeWidth={2.5} fill="currentColor" />}
                    {isMe && <span className="ml-0.5 shrink-0 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[8px] font-bold text-white">YOU</span>}
                    {groupQuest && memberDone && <Check size={11} className="shrink-0 text-emerald-400" strokeWidth={3} />}
                  </div>
                </div>
                <p className="text-[12px] font-bold tabular-nums text-white">{(m.xp || 0).toLocaleString()}</p>
              </div>
            );
          })}
          {Array.from({ length: MAX_SQUAD_SIZE - slotsUsed }).map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={() => setShowAddDemo(true)}
              className="flex w-full items-center gap-2.5 rounded-lg border border-dashed border-white/[0.1] px-2.5 py-2 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
            >
              <span className="w-4 text-center text-[11px] font-bold text-muted">{slotsUsed + i + 1}</span>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-white/15">
                <Plus size={12} className="text-zinc-500" />
              </div>
              <p className="flex-1 text-left text-[12px] text-muted">Add member</p>
            </button>
          ))}
        </div>
      </div>

      <GroupQuestPanel
        groupQuest={groupQuest} completions={completions} members={members}
        myCompletion={myCompletion} allDone={allDone}
        onCreate={() => setShowQuestModal(true)} onMarkDone={markGroupQuestDone}
      />

      {showAddDemo && (
        <AddDemoMemberModal
          excludeIds={memberIds} onClose={() => setShowAddDemo(false)} onAdd={addDemoToSquad}
        />
      )}

      {showQuestModal && (
        <CreateGroupQuestModal
          squadId={squad.id} myUser={myUser}
          onClose={() => setShowQuestModal(false)}
          onCreated={() => { setShowQuestModal(false); loadSquad(); }}
        />
      )}
    </>
  );
}

function AddDemoMemberModal({ excludeIds, onClose, onAdd }) {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("users").select("id, display_name, xp, rank, friend_code, avatar_id")
        .in("friend_code", DEMO_CODES);
      setDemos(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <ModalShell title="Add a member" onClose={onClose}>
      <p className="mt-1 text-[12px] text-muted">Pick a friend to add to your squad.</p>
      <div className="mt-4 space-y-2">
        {loading && <p className="py-4 text-center text-[12px] text-muted">Loading...</p>}
        {!loading && demos.length === 0 && (
          <p className="py-4 text-center text-[12px] text-muted">
            No demo friends found. Run the seed SQL for Gavin, Ashish, and Josh.
          </p>
        )}
        {demos.map((d) => {
          const already = excludeIds.has(d.id);
          return (
            <button
              key={d.id}
              onClick={() => !already && onAdd(d.friend_code)}
              disabled={already}
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                already ? "cursor-not-allowed border-white/[0.05] bg-white/[0.02] opacity-50"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
              }`}
            >
              <Avatar displayName={d.display_name} avatarId={d.avatar_id} rank={d.rank} size={36} />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-[13px] font-semibold text-white">{d.display_name}</p>
                <p className="text-[11px] text-muted">{d.rank} · {d.xp.toLocaleString()} XP</p>
              </div>
              <UserPlus size={14} className={already ? "text-zinc-600" : "text-[var(--accent)]"} strokeWidth={2.4} />
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

function GroupQuestPanel({ groupQuest, completions, members, myCompletion, allDone, onCreate, onMarkDone }) {
  if (!groupQuest) {
    return (
      <div className="future-panel p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--warm-soft)]">
            <Target size={16} className="text-[var(--warm)]" strokeWidth={2.2} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-white">No group quest</p>
            <p className="text-[11px] text-muted">All members complete it for a 1.5× bonus.</p>
          </div>
        </div>
        <button onClick={onCreate} className="future-button-warm mt-3 w-full px-3 py-2.5 text-[13px]">
          Post a group quest
        </button>
      </div>
    );
  }

  const dueDate = new Date(groupQuest.due_at);
  const daysLeft = Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const memberCount = members.length || 1;
  const progressPct = (completions.length / memberCount) * 100;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-4"
      style={{
        background: allDone
          ? "linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.04) 60%, var(--surface) 100%)"
          : "linear-gradient(135deg, rgba(255, 138, 61, 0.15) 0%, rgba(255, 138, 61, 0.03) 60%, var(--surface) 100%)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: allDone ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #ffa063, #ef6a1e)" }}>
          {allDone ? <Trophy size={16} className="text-white" strokeWidth={2.4} /> : <Target size={16} className="text-white" strokeWidth={2.4} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Squad Quest</p>
          <p className="text-[14px] font-bold leading-tight text-white">{groupQuest.title}</p>
          <p className="mt-1 text-[11px] text-muted">
            {allDone ? "Squad cleared it. +1.5× XP bonus paid out." : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left · ${groupQuest.xp_reward} XP pool`}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: allDone ? "#10b981" : "var(--warm)" }} />
      </div>
      <p className="mt-1.5 text-[11px] text-muted">{completions.length} of {memberCount} done</p>

      {!myCompletion && !allDone && (
        <button onClick={onMarkDone} className="future-button-warm mt-3 w-full px-3 py-2.5 text-[13px]">
          I did it
        </button>
      )}
      {myCompletion && !allDone && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] py-2.5 text-[12px] font-semibold text-emerald-400">
          <Check size={13} strokeWidth={2.5} />
          You're done. Waiting on the squad.
        </div>
      )}
      {allDone && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 py-2.5 text-[12px] font-bold text-emerald-300">
          <Sparkles size={13} strokeWidth={2.5} />
          Squad locked in. Bonus XP awarded.
        </div>
      )}
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
    const { data: newSquad, error: createError } = await supabase
      .from("squads").insert({ name: name.trim(), owner_id: myUser.id }).select().single();
    if (createError || !newSquad) { setError("Couldn't create squad"); setCreating(false); return; }
    const { error: memberError } = await supabase.from("squad_members").insert({ squad_id: newSquad.id, user_id: myUser.id });
    setCreating(false);
    if (memberError) { setError("Couldn't add you to squad"); return; }
    onCreated();
  }

  return (
    <ModalShell title="Create squad" onClose={onClose}>
      <p className="mt-1 text-[12px] text-muted">Pick a name. You'll get a 5-char code to share. Max 4 members.</p>
      <input
        autoFocus value={name} onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()} maxLength={30} placeholder="Squad name"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
      />
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="future-button-ghost flex-1 py-2.5 text-[14px]">Cancel</button>
        <button onClick={handleCreate} disabled={creating || !name.trim()} className="future-button flex-1 py-2.5 text-[14px] disabled:opacity-50">
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
    const { data: targetSquad } = await supabase.from("squads").select("id, name").eq("code", cleanCode).maybeSingle();
    if (!targetSquad) { setError("Squad code not found"); setJoining(false); return; }
    const { error: insertError } = await supabase.from("squad_members").insert({ squad_id: targetSquad.id, user_id: myUser.id });
    setJoining(false);
    if (insertError) {
      if (insertError.message?.includes("full")) setError("That squad is full (4/4)");
      else if (insertError.code === "23505") setError("You're already in this squad");
      else setError("Couldn't join squad");
      return;
    }
    onJoined();
  }

  return (
    <ModalShell title="Join squad" onClose={onClose}>
      <p className="mt-1 text-[12px] text-muted">Paste the 5-character squad code.</p>
      <input
        autoFocus value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleJoin()} maxLength={6} placeholder="HACK1"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 font-mono text-[16px] tracking-[0.2em] text-white placeholder:font-sans placeholder:text-[14px] placeholder:tracking-normal placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
      />
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="future-button-ghost flex-1 py-2.5 text-[14px]">Cancel</button>
        <button onClick={handleJoin} disabled={joining || !code.trim()} className="future-button flex-1 py-2.5 text-[14px] disabled:opacity-50">
          {joining ? "Joining..." : "Join"}
        </button>
      </div>
    </ModalShell>
  );
}

function CreateGroupQuestModal({ squadId, myUser, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreate() {
    if (!title.trim() || creating || !myUser) return;
    setCreating(true);
    const { error: insertError } = await supabase.from("squad_quests").insert({
      squad_id: squadId, created_by: myUser.id, title: title.trim(), xp_reward: 200,
    });
    setCreating(false);
    if (insertError) { setError("Couldn't post quest"); return; }
    onCreated();
  }

  return (
    <ModalShell title="Post a group quest" onClose={onClose}>
      <p className="mt-1 text-[12px] text-muted">Everyone in your squad has 7 days. All clear → 1.5× bonus.</p>
      <input
        autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleCreate()} maxLength={60} placeholder="e.g. Hit the gym 3 times"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
      />
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="future-button-ghost flex-1 py-2.5 text-[14px]">Cancel</button>
        <button onClick={handleCreate} disabled={creating || !title.trim()} className="future-button flex-1 py-2.5 text-[14px] disabled:opacity-50">
          {creating ? "Posting..." : "Post quest"}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="future-panel-elevated w-full max-w-sm p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-white">{title}</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/[0.05] hover:text-white">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
