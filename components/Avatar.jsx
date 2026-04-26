"use client";

import { useMemo } from "react";
import { generateAvatarUri } from "../lib/avatars";

const rankColors = {
  Bronze: "#cd7f32",
  Silver: "#c0c0c0",
  Gold: "#fbbf24",
  Platinum: "#7dd3fc",
  Diamond: "#60a5fa",
  Champion: "#a78bfa",
  Grandmaster: "#f472b6",
  Legendary: "#fb923c",
  Surreal: "#ffffff",
};

export default function Avatar({
  displayName,
  avatarId = "auto",
  avatarUrl = null,
  rank = "Bronze",
  size = 40,
  glow = false,
  surreal = false,
}) {
  const rankColor = rankColors[rank] || rankColors.Bronze;
  const isSurreal = surreal || rank === "Surreal";

  // Generate DiceBear avatar from seed
  const generatedUri = useMemo(
    () => generateAvatarUri(displayName || "anonymous", avatarId),
    [displayName, avatarId],
  );

  const baseStyle = {
    width: size,
    height: size,
    boxShadow: glow
      ? isSurreal
        ? `0 0 ${size * 0.4}px rgba(255, 255, 255, 0.7)`
        : `0 0 ${size * 0.3}px ${rankColor}50`
      : undefined,
  };

  const ringStyle = isSurreal
    ? {
        background: "linear-gradient(135deg, #ffffff, #d4d4d8, #ffffff)",
        padding: 2,
      }
    : {};

  // Custom uploaded image — use that instead
  if (avatarUrl) {
    return (
      <div
        className="overflow-hidden rounded-full ring-2 ring-white/10"
        style={baseStyle}
      >
        <img
          src={avatarUrl}
          alt={displayName || "Avatar"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // DiceBear generated avatar
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full"
      style={{ ...baseStyle, ...ringStyle }}
    >
      <img
        src={generatedUri}
        alt={displayName || "Avatar"}
        className="h-full w-full rounded-full object-cover"
        style={isSurreal ? { borderRadius: "50%" } : undefined}
      />
    </div>
  );
}
