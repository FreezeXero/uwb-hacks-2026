"use client";

import { useEffect, useMemo } from "react";
import { Sparkles, Share2, X } from "lucide-react";

const rankEmoji = {
  Bronze: "🥉",
  Silver: "🥈",
  Gold: "🥇",
  Platinum: "💎",
  Diamond: "💎",
  Champion: "👑",
  Grandmaster: "🏆",
  Legendary: "⭐",
};

export default function RankUpCelebration({ rankUp, onClose }) {
  // 50 confetti pieces with randomized properties
  const pieces = useMemo(() => {
    const colors = [
      "#4f8cff",
      "#ff8a3d",
      "#fbbf24",
      "#a78bfa",
      "#10b981",
      "#f472b6",
      "#ffffff",
    ];
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.5 + Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.random() * 360,
    }));
  }, [rankUp?.to]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!rankUp) return null;

  const newRank = rankUp.to;
  const color = rankUp.color || "#4f8cff";
  const emoji = rankEmoji[newRank] || "⭐";

  function handleShare() {
    const text = `Just hit ${newRank} on Ascend 🔥`;
    if (navigator.share) {
      navigator.share({ title: "Ascend rank up", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-md fade-in"
      style={{ "--rank-up-color": `${color}80` }}
    >
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              top: "-20px",
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>

      {/* Close (top right, subtle) */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 backdrop-blur-md transition hover:bg-white/20 hover:text-white"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* RANK UP small text */}
        <p className="text-[14px] font-semibold uppercase tracking-[0.3em] text-white/60">
          Rank up
        </p>

        {/* Big rank orb */}
        <div
          className="rank-up-orb mt-4 flex h-32 w-32 items-center justify-center rounded-full text-6xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}, ${color}88 60%, ${color}33 100%)`,
            boxShadow: `0 0 80px ${color}80, inset 0 0 40px rgba(255,255,255,0.2)`,
          }}
        >
          {emoji}
        </div>

        {/* New rank name */}
        <h1
          className="mt-6 text-[56px] font-black leading-none tracking-tight"
          style={{
            color,
            textShadow: `0 0 30px ${color}80`,
          }}
        >
          {newRank}
        </h1>

        <p className="mt-2 text-[14px] text-white/60">
          You leveled up from {rankUp.from}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-black transition hover:bg-white/90"
          >
            <Share2 size={14} strokeWidth={2.4} />
            Share
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/20 bg-white/[0.06] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-white/[0.12]"
          >
            Keep going
          </button>
        </div>

        <p className="mt-6 flex items-center gap-1.5 text-[12px] text-white/40">
          <Sparkles size={11} />
          Earned through {rankUp.questCount || "consistent"} effort
        </p>
      </div>
    </div>
  );
}
