"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Copy,
  Check,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  X,
  Camera,
  Flame,
  Mail,
  Lock,
  Info,
} from "lucide-react";
import { useAppState } from "./AppStateProvider";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import AvatarPickerModal from "./AvatarPickerModal";
import EventTag from "./EventTag";

// Hardcoded event tags for the demo - earned through events
const DEMO_TAGS = [
  { label: "UWB Hack Week '26", color: "#fbbf24" },
  { label: "Squad Wars Finalist", color: "#a78bfa" },
];

export default function AvatarProfile() {
  const router = useRouter();
  const {
    auth0Id, displayName, xp, rank, rankColor, quests, streakDays, multiplier,
    avatarId, avatarUrl, setAvatar,
  } = useAppState();

  const [me, setMe] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'notifications' | 'privacy' | 'help'
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    if (!auth0Id) return;
    (async () => {
      const { data } = await supabase
        .from("users").select("id, friend_code, avatar_id, avatar_url")
        .eq("auth0_id", auth0Id).single();
      if (data) setMe(data);
    })();
  }, [auth0Id]);

  const completedQuests = quests.filter((q) => q.done).length;
  const handle = displayName ? displayName.toLowerCase().replace(/\s+/g, "") : "player";
  const friendCode = me?.friend_code;

  function copyFriendCode() {
    if (!friendCode) return;
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function openNameEdit() {
    setNameInput(displayName || "");
    setNameError(null);
    setEditingName(true);
  }

  async function saveName() {
    const newName = nameInput.trim();
    if (!newName || savingName) return;
    if (newName === displayName) { setEditingName(false); return; }
    setSavingName(true);
    const { error } = await supabase.from("users").update({ display_name: newName }).eq("auth0_id", auth0Id);
    setSavingName(false);
    if (error) setNameError("Couldn't save");
    else { setEditingName(false); router.refresh(); }
  }

  return (
    <>
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center pt-2">
          <button
            type="button"
            onClick={() => setPickingAvatar(true)}
            className="group relative"
            aria-label="Change avatar"
          >
            <Avatar
              displayName={displayName} avatarId={avatarId} avatarUrl={avatarUrl}
              rank={rank} size={84} glow
            />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--background)] bg-white text-zinc-900 transition group-hover:bg-zinc-200">
              <Camera size={12} strokeWidth={2.5} />
            </div>
          </button>
          <h2 className="mt-3 flex items-center gap-1.5 text-xl font-bold tracking-tight text-white">
            {displayName}
            <button onClick={openNameEdit} className="text-zinc-500 transition hover:text-white">
              <Pencil size={12} strokeWidth={2.4} />
            </button>
          </h2>
          <p className="text-[13px] text-muted">@{handle}</p>

          {/* Glowing event tags */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {DEMO_TAGS.map((tag) => (
              <EventTag key={tag.label} label={tag.label} color={tag.color} />
            ))}
          </div>
        </div>

        {/* Friend code */}
        <button
          onClick={copyFriendCode}
          className="future-panel flex w-full items-center justify-between p-4 transition hover:border-white/15"
        >
          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Your Friend Code</p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-[0.18em] text-white">
              {friendCode || "------"}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
            {copied ? <Check size={16} className="text-emerald-400" strokeWidth={2.5} /> : <Copy size={15} className="text-zinc-400" strokeWidth={2} />}
          </div>
        </button>

        {/* Streak card with lucide Flame icon */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-4"
          style={{
            background: "linear-gradient(135deg, rgba(255, 138, 61, 0.18) 0%, rgba(255, 138, 61, 0.04) 60%, var(--surface) 100%)",
            boxShadow: "0 4px 20px rgba(255, 138, 61, 0.12)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg, #ffa063, #ef6a1e)",
                boxShadow: "0 0 16px rgba(255, 138, 61, 0.4)",
              }}
            >
              <Flame size={22} className="text-white" strokeWidth={2.4} fill="currentColor" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Active Streak</p>
              <p className="text-[22px] font-bold leading-tight text-white">{streakDays} days</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">XP Boost</p>
              <p className="text-[22px] font-bold leading-tight text-[var(--warm)]">{multiplier}×</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {multiplier >= 2
              ? "Maxed out. Don't break the streak."
              : multiplier >= 1.5
              ? "On fire. 30 days = 2× XP."
              : multiplier >= 1.25
              ? "Keep stacking. 14 days = 1.5×."
              : `${7 - streakDays} more days for 1.25× XP boost`}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Rank" value={rank} valueColor={rankColor} />
          <StatCard label="Total XP" value={xp.toLocaleString()} />
          <StatCard label="Completed" value={completedQuests.toString()} />
        </div>

        <div className="future-panel divide-y divide-white/[0.04] overflow-hidden">
          <SettingsRow icon={Pencil} label="Edit name" onClick={openNameEdit} />
          <SettingsRow icon={Camera} label="Change avatar" onClick={() => setPickingAvatar(true)} />
          <SettingsRow icon={Bell} label="Notifications" onClick={() => setActiveModal("notifications")} />
          <SettingsRow icon={Shield} label="Privacy" onClick={() => setActiveModal("privacy")} />
          <SettingsRow icon={HelpCircle} label="Help & support" onClick={() => setActiveModal("help")} />
        </div>

        <a
          href="/auth/logout"
          className="future-panel flex w-full items-center justify-center gap-2 p-4 text-[14px] font-semibold text-red-400 transition hover:border-red-500/20 hover:bg-red-500/[0.04]"
        >
          <LogOut size={16} strokeWidth={2.2} />
          Sign out
        </a>

        <p className="pb-2 text-center text-[11px] text-muted/60">
          Ascend v0.1 · Built at UWB Hacks 2026
        </p>
      </div>

      {editingName && (
        <EditNameModal
          value={nameInput} onChange={setNameInput}
          onSave={saveName} onClose={() => setEditingName(false)}
          saving={savingName} error={nameError}
        />
      )}

      {pickingAvatar && me && (
        <AvatarPickerModal
          myUser={me} displayName={displayName} rank={rank}
          currentAvatarId={avatarId} currentAvatarUrl={avatarUrl}
          onClose={() => setPickingAvatar(false)}
          onSaved={(p) => { setAvatar(p); setPickingAvatar(false); }}
        />
      )}

      {activeModal === "notifications" && <NotificationsModal onClose={() => setActiveModal(null)} />}
      {activeModal === "privacy" && <PrivacyModal onClose={() => setActiveModal(null)} />}
      {activeModal === "help" && <HelpModal onClose={() => setActiveModal(null)} />}
    </>
  );
}

function StatCard({ label, value, valueColor }) {
  return (
    <div className="future-panel p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 text-[18px] font-bold tracking-tight text-white" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </p>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon size={15} className="text-zinc-300" strokeWidth={2} />
      </div>
      <span className="flex-1 text-[14px] font-medium text-white">{label}</span>
      <ChevronRight size={16} className="text-zinc-500" strokeWidth={2} />
    </button>
  );
}

function EditNameModal({ value, onChange, onSave, onClose, saving, error }) {
  return (
    <ModalShell title="Edit display name" onClose={onClose}>
      <p className="mt-1 text-[12px] text-muted">This is how friends see you on the leaderboard.</p>
      <input
        autoFocus value={value} onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSave()} maxLength={40} placeholder="Your name"
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
      />
      {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}
      <div className="mt-4 flex gap-2">
        <button onClick={onClose} className="future-button-ghost flex-1 py-2.5 text-[14px]">Cancel</button>
        <button onClick={onSave} disabled={saving || !value.trim()} className="future-button flex-1 py-2.5 text-[14px] disabled:opacity-50">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </ModalShell>
  );
}

function NotificationsModal({ onClose }) {
  const [toggles, setToggles] = useState({
    streakRisk: true,
    friendNudges: true,
    squadAlerts: true,
    rankUps: true,
    weeklyDigest: false,
    marketing: false,
  });

  function flip(key) {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const items = [
    { key: "streakRisk", label: "Streak risk alerts", desc: "Ping me before I lose my streak" },
    { key: "friendNudges", label: "Friend nudges", desc: "When someone nudges you to lock in" },
    { key: "squadAlerts", label: "Squad activity", desc: "Group quest progress and member events" },
    { key: "rankUps", label: "Rank-ups", desc: "Celebrate when you or friends rank up" },
    { key: "weeklyDigest", label: "Weekly digest", desc: "Summary of your week, every Sunday" },
    { key: "marketing", label: "Product news", desc: "New features and updates" },
  ];

  return (
    <ModalShell title="Notifications" onClose={onClose} icon={Bell}>
      <p className="mt-1 text-[12px] text-muted">Pick what pings you. You can change these any time.</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => flip(item.key)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-left transition hover:border-white/15"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white">{item.label}</p>
              <p className="text-[11px] text-muted">{item.desc}</p>
            </div>
            <div
              className={`flex h-6 w-10 items-center rounded-full p-0.5 transition ${
                toggles[item.key] ? "bg-[var(--accent)]" : "bg-white/[0.1]"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition ${
                  toggles[item.key] ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>
        ))}
      </div>
      <button onClick={onClose} className="future-button mt-5 w-full py-2.5 text-[14px]">
        Save preferences
      </button>
    </ModalShell>
  );
}

function PrivacyModal({ onClose }) {
  return (
    <ModalShell title="Privacy" onClose={onClose} icon={Shield}>
      <div className="mt-4 space-y-3 text-[12.5px] leading-relaxed text-zinc-300">
        <Item icon={Lock}>
          <strong className="text-white">Your data is yours.</strong> Quest history, streaks, and squads stay on your account. We never sell it. We never share it with advertisers.
        </Item>
        <Item icon={Shield}>
          <strong className="text-white">AI verification stays anonymized.</strong> When Claude verifies a quest, the conversation is processed and immediately discarded. We don't keep verification chat logs.
        </Item>
        <Item icon={Info}>
          <strong className="text-white">Friends only see what you choose.</strong> Your rank, XP, and current streak are visible to friends. Your specific quest history is private by default.
        </Item>
        <Item icon={Lock}>
          <strong className="text-white">Delete your account anytime.</strong> One tap in settings removes your account and all associated data within 30 days.
        </Item>
      </div>
      <button onClick={onClose} className="future-button mt-5 w-full py-2.5 text-[14px]">Got it</button>
    </ModalShell>
  );
}

function HelpModal({ onClose }) {
  return (
    <ModalShell title="Help & support" onClose={onClose} icon={HelpCircle}>
      <div className="mt-4 space-y-3">
        <a
          href="mailto:ascend@uwbhacks.dev"
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
            <Mail size={15} className="text-[var(--accent)]" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white">Email us</p>
            <p className="text-[11px] text-muted">ascend@uwbhacks.dev</p>
          </div>
          <ChevronRight size={14} className="text-zinc-500" />
        </a>

        <div className="future-panel p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            Quick tips
          </p>
          <ul className="mt-2 space-y-2 text-[12.5px] text-zinc-300">
            <li className="flex gap-2">
              <span className="text-[var(--accent)]">·</span>
              Streaks reset if you skip a day. Even one quest counts.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)]">·</span>
              Squad quests need ALL 4 members. Pick teammates who lock in.
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)]">·</span>
              Be specific when AI verifies your quest. "Did 30 push-ups, 3 sets of 10" beats "worked out."
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent)]">·</span>
              Live events stack. UWB Hack Week + your streak = serious XP.
            </li>
          </ul>
        </div>

        <p className="text-center text-[11px] text-muted">
          Reading our docs? They're at <span className="text-zinc-300">ascend.app/docs</span> (placeholder).
        </p>
      </div>

      <button onClick={onClose} className="future-button mt-5 w-full py-2.5 text-[14px]">Close</button>
    </ModalShell>
  );
}

function Item({ icon: Icon, children }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
        <Icon size={13} className="text-[var(--accent)]" strokeWidth={2.2} />
      </div>
      <div>{children}</div>
    </div>
  );
}

function ModalShell({ title, onClose, children, icon: Icon }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="future-panel-elevated w-full max-w-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                <Icon size={15} className="text-[var(--accent)]" strokeWidth={2.2} />
              </div>
            )}
            <h3 className="text-[17px] font-bold text-white">{title}</h3>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/[0.05] hover:text-white">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
