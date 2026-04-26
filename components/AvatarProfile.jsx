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
} from "lucide-react";
import { useAppState } from "./AppStateProvider";
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

export default function AvatarProfile() {
  const router = useRouter();
  const { auth0Id, displayName, xp, rank, quests } = useAppState();
  const [friendCode, setFriendCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!auth0Id) return;
    (async () => {
      const { data } = await supabase
        .from("users")
        .select("friend_code")
        .eq("auth0_id", auth0Id)
        .single();
      if (data) setFriendCode(data.friend_code);
    })();
  }, [auth0Id]);

  const completedQuests = quests.filter((q) => q.done).length;
  const handle = displayName ? displayName.toLowerCase().replace(/\s+/g, "") : "player";
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "P";
  const rankColor = rankColors[rank] || rankColors.Bronze;

  function copyFriendCode() {
    if (!friendCode) return;
    navigator.clipboard.writeText(friendCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function openEdit() {
    setNameInput(displayName || "");
    setSaveError(null);
    setEditing(true);
  }

  async function saveName() {
    const newName = nameInput.trim();
    if (!newName || saving) return;
    if (newName === displayName) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from("users")
      .update({ display_name: newName })
      .eq("auth0_id", auth0Id);

    setSaving(false);

    if (error) {
      setSaveError("Couldn't save, try again");
    } else {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <>
      <div className="space-y-5">
        {/* Avatar + identity */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${rankColor} 0%, ${rankColor}99 100%)`,
                boxShadow: `0 0 28px ${rankColor}50`,
              }}
            >
              {initials}
            </div>
            <button
              type="button"
              onClick={openEdit}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--background)] bg-white text-zinc-900 transition hover:bg-zinc-200"
              aria-label="Edit profile"
            >
              <Pencil size={12} strokeWidth={2.5} />
            </button>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
            {displayName}
          </h2>
          <p className="text-[13px] text-muted">@{handle}</p>
        </div>

        {/* Friend code card */}
        <button
          type="button"
          onClick={copyFriendCode}
          className="future-panel flex w-full items-center justify-between p-4 transition hover:border-white/15"
        >
          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Your Friend Code
            </p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-[0.18em] text-white">
              {friendCode || "------"}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
            {copied ? (
              <Check size={16} className="text-emerald-400" strokeWidth={2.5} />
            ) : (
              <Copy size={15} className="text-zinc-400" strokeWidth={2} />
            )}
          </div>
        </button>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Rank" value={rank} valueColor={rankColor} />
          <StatCard label="Total XP" value={xp.toLocaleString()} />
          <StatCard label="Completed" value={completedQuests.toString()} />
        </div>

        {/* Settings list */}
        <div className="future-panel divide-y divide-white/[0.04] overflow-hidden">
          <SettingsRow icon={Pencil} label="Edit profile" onClick={openEdit} />
          <SettingsRow icon={Bell} label="Notifications" />
          <SettingsRow icon={Shield} label="Privacy" />
          <SettingsRow icon={HelpCircle} label="Help & support" />
        </div>

        {/* Sign out */}
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

      {/* Edit name modal */}
      {editing && (
        <EditNameModal
          value={nameInput}
          onChange={setNameInput}
          onSave={saveName}
          onClose={() => setEditing(false)}
          saving={saving}
          error={saveError}
        />
      )}
    </>
  );
}

function StatCard({ label, value, valueColor }) {
  return (
    <div className="future-panel p-3">
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p
        className="mt-1 text-[18px] font-bold tracking-tight text-white"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]"
    >
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="future-panel-elevated w-full max-w-sm p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-white">Edit display name</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/[0.05] hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-1 text-[12px] text-muted">
          This is how friends see you on the leaderboard.
        </p>

        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave();
          }}
          maxLength={40}
          placeholder="Your name"
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        />

        {error && <p className="mt-2 text-[12px] text-red-400">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="future-button-ghost flex-1 py-2.5 text-[14px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !value.trim()}
            className="future-button flex-1 py-2.5 text-[14px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
