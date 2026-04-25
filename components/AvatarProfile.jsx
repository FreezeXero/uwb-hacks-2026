"use client";

import { useEffect, useRef, useState } from "react";
import { useAppState } from "./AppStateProvider";

const profile = {
  name: "Rafay Farah",
  username: "@rafay",
  userId: "48217",
  level: 12,
  streak: 19,
  playerClass: "Neon Pilot",
  badges: ["Quantum Discipline", "Pulse Focus", "Iron Loop"],
};

const defaultAvatarOptions = ["🧑‍🚀", "🛡️", "🤖", "🧠", "⚔️", "🎯"];

function getRankClasses(rank) {
  if (rank === "Bronze") {
    return "text-amber-500 drop-shadow-[0_0_8px_rgba(180,83,9,0.85)]";
  }

  if (rank === "Champion") {
    return "text-violet-700 drop-shadow-[0_0_8px_rgba(167,139,250,0.55)]";
  }

  if (rank === "Grand Champion") {
    return "text-red-600 drop-shadow-[0_0_9px_rgba(248,113,113,0.6)]";
  }

  if (rank === "Legendary") {
    return "text-zinc-800 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]";
  }

  if (rank === "Diamond") {
    return "text-sky-600";
  }

  if (rank === "Silver") {
    return "text-slate-600";
  }

  return "text-muted";
}

export default function AvatarProfile() {
  const { xp, rank } = useAppState();
  const fileInputRef = useRef(null);
  const avatarMenuRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatarOptions[0]);

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!avatarMenuOpen) {
        return;
      }

      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
        setAvatarMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [avatarMenuOpen]);

  function onPhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }

    setPhotoUrl(URL.createObjectURL(file));
    setAvatarMenuOpen(false);
  }

  function chooseDefaultAvatar(avatar) {
    setSelectedAvatar(avatar);
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
      setPhotoUrl("");
    }
    setAvatarMenuOpen(false);
  }

  function openUploader() {
    fileInputRef.current?.click();
  }

  return (
    <section className="space-y-4">
      <div className="future-panel rounded-2xl p-4">
        <div className="mb-3 flex justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
            Hyperdrive Elite
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div ref={avatarMenuRef} className="group relative h-24 w-24 overflow-visible">
            <button
              type="button"
              onClick={() => setAvatarMenuOpen((open) => !open)}
              className="absolute bottom-0 right-0 z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white text-xs text-muted shadow-lg group-hover:flex group-focus-within:flex"
              aria-label="Edit profile picture"
            >
              ✎
            </button>

            <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-zinc-500/70 bg-zinc-800 shadow-[0_0_18px_rgba(0,0,0,0.45)]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Profile upload preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl">
                  {selectedAvatar}
                </div>
              )}
            </div>

            {avatarMenuOpen ? (
              <div className="absolute left-0 top-[6.4rem] z-20 w-56 rounded-xl border border-zinc-200 bg-white p-3 shadow-[0_18px_28px_rgba(0,0,0,0.22)]">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Choose avatar
                  </p>
                  <button
                    type="button"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="rounded-md border border-zinc-200 px-1.5 py-0.5 text-xs text-muted hover:bg-white/[0.03]"
                    aria-label="Close avatar menu"
                  >
                    X
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {defaultAvatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => chooseDefaultAvatar(avatar)}
                      className="rounded-lg border border-zinc-200 bg-white/[0.03] py-1 text-xl"
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={openUploader}
                  className="future-button mt-3 w-full px-2 py-2 text-xs"
                >
                  Upload your own
                </button>
              </div>
            ) : null}
          </div>
          <div>
            <p className="text-lg font-bold text-white">{profile.name}</p>
            <p className="text-sm text-muted">{profile.username}</p>
            <p className="mt-1 text-xs text-muted">ID: {profile.userId}</p>
            <p className="mt-1 text-xs text-muted">{profile.playerClass}</p>
            <p className={`mt-1 text-sm font-semibold ${getRankClasses(rank)}`}>
              {rank}
            </p>
            <p className="text-xs text-muted">{xp} XP total</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotoUpload}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="future-panel rounded-2xl p-3">
          <p className="text-xs uppercase tracking-wider text-muted">Level</p>
          <p className="mt-1 text-2xl font-bold text-white">{profile.level}</p>
        </div>
        <div className="future-panel rounded-2xl p-3">
          <p className="text-xs uppercase tracking-wider text-muted">Streak</p>
          <p className="mt-1 text-2xl font-bold text-white">{profile.streak}d</p>
        </div>
      </div>

      <div className="future-panel rounded-2xl p-4">
        <p className="text-sm font-semibold text-white">Rank Progress</p>
        <p className="mt-2 text-xs text-muted">
          Start at Bronze and rank up automatically by completing quests for XP.
        </p>
        <p className="mt-2 text-sm text-muted">Current: {rank}</p>
      </div>

      <div className="future-panel rounded-2xl p-4">
        <p className="text-sm font-semibold text-white">🏆 Achievements</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
