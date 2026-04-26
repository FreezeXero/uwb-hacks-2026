// DiceBear-powered avatar system. Each user gets a unique illustrated character
// generated from a seed (their name or auth0_id). No image hosting required.

import { createAvatar } from "@dicebear/core";
import { funEmoji, personas, lorelei, thumbs, bottts } from "@dicebear/collection";

// Style options for the picker — each generates a distinct look from the same seed
export const AVATAR_STYLES = [
  { id: "auto", label: "Auto", description: "Default character" },
  { id: "personas", label: "Persona", description: "Illustrated portrait" },
  { id: "lorelei", label: "Lorelei", description: "Stylized character" },
  { id: "thumbs", label: "Thumb", description: "Cartoon thumb avatar" },
  { id: "bottts", label: "Bot", description: "Robot avatar" },
  { id: "fun", label: "Fun", description: "Playful icon" },
];

const COLLECTIONS = {
  personas,
  lorelei,
  thumbs,
  bottts,
  fun: funEmoji,
};

function getCollection(styleId) {
  if (styleId === "auto") return personas;
  return COLLECTIONS[styleId] || personas;
}

// Given a seed (name) and style, return a data URI SVG avatar
export function generateAvatarUri(seed, styleId = "auto") {
  if (!seed) seed = "anonymous";
  const collection = getCollection(styleId);
  const avatar = createAvatar(collection, {
    seed: String(seed),
    size: 128,
    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
    backgroundType: ["solid", "gradientLinear"],
    radius: 50,
  });
  return avatar.toDataUri();
}

export function getInitials(displayName) {
  if (!displayName) return "?";
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
