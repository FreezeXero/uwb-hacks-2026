"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "ascend-app-state-v7";

const rankConfig = [
  { name: "Bronze", minXp: 0, color: "#cd7f32", glow: "rgba(205, 127, 50, 0.5)" },
  { name: "Silver", minXp: 500, color: "#c0c0c0", glow: "rgba(192, 192, 192, 0.5)" },
  { name: "Gold", minXp: 1500, color: "#fbbf24", glow: "rgba(251, 191, 36, 0.5)" },
  { name: "Platinum", minXp: 3500, color: "#7dd3fc", glow: "rgba(125, 211, 252, 0.5)" },
  { name: "Diamond", minXp: 7000, color: "#60a5fa", glow: "rgba(96, 165, 250, 0.6)" },
  { name: "Champion", minXp: 12000, color: "#a78bfa", glow: "rgba(167, 139, 250, 0.6)" },
  { name: "Grandmaster", minXp: 20000, color: "#f472b6", glow: "rgba(244, 114, 182, 0.6)" },
  { name: "Legendary", minXp: 35000, color: "#fb923c", glow: "rgba(251, 146, 60, 0.7)" },
  { name: "Surreal", minXp: 60000, color: "#ffffff", glow: "rgba(255, 255, 255, 0.85)" },
];

const defaultQuests = [
  { id: "q-1", title: "Leetcode 1 hour", progress: "0 / 1", xp: 120, done: false, cadence: "daily", missionType: "focus", icon: "code" },
  { id: "q-2", title: "Study 45 minutes", progress: "0 / 1", xp: 100, done: false, cadence: "daily", missionType: "focus", icon: "book" },
  { id: "q-3", title: "Gym session", progress: "0 / 1", xp: 110, done: false, cadence: "daily", missionType: "fitness", icon: "dumbbell" },
  { id: "q-4", title: "Read non-fiction 30 min", progress: "0 / 1", xp: 80, done: false, cadence: "daily", missionType: "focus", icon: "book-open" },
  { id: "q-5", title: "Sleep 8 hours", progress: "0 / 1", xp: 90, done: false, cadence: "daily", missionType: "wellness", icon: "moon" },
  { id: "q-6", title: "Side project 2 hours", progress: "0 / 5", xp: 280, done: false, cadence: "weekly", missionType: "focus", icon: "code" },
  { id: "q-7", title: "Gym 3x this week", progress: "0 / 3", xp: 250, done: false, cadence: "weekly", missionType: "fitness", icon: "dumbbell" },
  { id: "q-8", title: "Finish a book", progress: "0 / 1", xp: 200, done: false, cadence: "weekly", missionType: "focus", icon: "book" },
];

/**
 * @typedef {Object} Quest
 * @property {string} id
 * @property {string} title
 * @property {string} progress
 * @property {number} xp
 * @property {boolean} done
 * @property {"daily"|"weekly"} cadence
 * @property {string} missionType
 * @property {string | null} [icon]
 */

/**
 * @typedef {Object} AppStateValue
 * @property {number} xp
 * @property {string} rank
 * @property {string} rankColor
 * @property {string} rankGlow
 * @property {string | null} nextRankName
 * @property {number} xpToNext
 * @property {number} progressPct
 * @property {typeof rankConfig} rankConfig
 * @property {unknown} recentRankUp
 * @property {string | null} auth0Id
 * @property {string} displayName
 * @property {number} streakDays
 * @property {(n: number) => void} setStreakDays
 * @property {number} multiplier
 * @property {string} avatarId
 * @property {string | null} avatarUrl
 * @property {(a: { avatarId: string; avatarUrl: string | null }) => void} setAvatar
 * @property {unknown} activeNotification
 * @property {(notif: unknown) => void} pushNotification
 * @property {() => void} dismissNotification
 * @property {() => void} clearRankUp
 * @property {(amount: number) => void} addXp
 * @property {(newXp: number) => void} setXpDirect
 * @property {(rankName: string, color: string) => void} triggerRankUp
 * @property {() => void} resetXp
 * @property {Quest[]} quests
 * @property {(q: { title?: string; cadence?: string; xp?: number; missionType?: string; icon?: string | null }) => Quest} addQuest
 * @property {(questId: string) => void} completeQuest
 * @property {(questId: string) => void} removeQuest
 */

/** @type {import("react").Context<AppStateValue | null>} */
const AppStateContext = createContext(null);

function getRankFromXp(xp) {
  let active = rankConfig[0];
  for (const rank of rankConfig) {
    if (xp >= rank.minXp) active = rank;
  }
  return active;
}

function getNextRank(currentRankName) {
  const i = rankConfig.findIndex((r) => r.name === currentRankName);
  if (i === -1 || i === rankConfig.length - 1) return null;
  return rankConfig[i + 1];
}

export function getStreakMultiplier(streakDays) {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 14) return 1.5;
  if (streakDays >= 7) return 1.25;
  return 1.0;
}

export function AppStateProvider({ children, auth0Id, displayName }) {
  const [xp, setXp] = useState(6800);
  const [quests, setQuests] = useState(defaultQuests);
  const [recentRankUp, setRecentRankUp] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [streakDays, setStreakDays] = useState(8);
  const [avatarId, setAvatarId] = useState("auto");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const syncTimerRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.xp === "number" && parsed.xp >= 0) setXp(parsed.xp);
        if (Array.isArray(parsed.quests) && parsed.quests.length > 0) setQuests(parsed.quests);
        if (typeof parsed.streakDays === "number") setStreakDays(parsed.streakDays);
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!auth0Id) return;
    (async () => {
      const { data } = await supabase
        .from("users")
        .select("avatar_id, avatar_url, streak_days")
        .eq("auth0_id", auth0Id)
        .single();
      if (data) {
        setAvatarId(data.avatar_id || "auto");
        setAvatarUrl(data.avatar_url || null);
        if (typeof data.streak_days === "number" && data.streak_days > 0) {
          setStreakDays(data.streak_days);
        }
      }
    })();
  }, [auth0Id]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp, quests, streakDays }));
  }, [xp, quests, streakDays, hydrated]);

  useEffect(() => {
    if (!hydrated || !auth0Id) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      const currentRank = getRankFromXp(xp);
      await supabase
        .from("users")
        .update({ xp, rank: currentRank.name, streak_days: streakDays })
        .eq("auth0_id", auth0Id);
    }, 800);
    return () => syncTimerRef.current && clearTimeout(syncTimerRef.current);
  }, [xp, streakDays, auth0Id, hydrated]);

  const value = useMemo(() => {
    const currentRank = getRankFromXp(xp);
    const nextRank = getNextRank(currentRank.name);
    const xpToNext = nextRank ? nextRank.minXp - xp : 0;
    const xpInTier = nextRank ? xp - currentRank.minXp : 0;
    const tierSize = nextRank ? nextRank.minXp - currentRank.minXp : 1;
    const progressPct = nextRank ? Math.min(100, Math.max(0, (xpInTier / tierSize) * 100)) : 100;
    const multiplier = getStreakMultiplier(streakDays);

    function setXpAndDetectRankUp(newXp) {
      const oldRank = getRankFromXp(xp);
      const newRank = getRankFromXp(newXp);
      if (oldRank.name !== newRank.name && newRank.minXp > oldRank.minXp) {
        setRecentRankUp({
          from: oldRank.name,
          to: newRank.name,
          color: newRank.color,
          glow: newRank.glow,
        });
      }
      setXp(newXp);
    }

    return {
      xp,
      rank: currentRank.name,
      rankColor: currentRank.color,
      rankGlow: currentRank.glow,
      nextRankName: nextRank ? nextRank.name : null,
      xpToNext,
      progressPct,
      rankConfig,
      recentRankUp,
      auth0Id: auth0Id || null,
      displayName: displayName || "Player",
      streakDays,
      setStreakDays,
      multiplier,
      avatarId,
      avatarUrl,
      setAvatar: ({ avatarId: id, avatarUrl: url }) => {
        setAvatarId(id);
        setAvatarUrl(url);
      },
      activeNotification,
      pushNotification: (notif) => setActiveNotification(notif),
      dismissNotification: () => setActiveNotification(null),
      clearRankUp: () => setRecentRankUp(null),
      addXp: (amount) => {
        const boosted = Math.round(Math.max(0, amount) * multiplier);
        setXpAndDetectRankUp(xp + boosted);
      },
      setXpDirect: (newXp) => {
        const safe = Math.max(0, newXp);
        setXpAndDetectRankUp(safe);
      },
      triggerRankUp: (rankName, color) => {
        setRecentRankUp({ from: currentRank.name, to: rankName, color, glow: color });
      },
      resetXp: () => setXp(0),
      quests,
      addQuest: (questData) => {
        const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const cadence = questData.cadence === "weekly" ? "weekly" : "daily";
        const newQuest = {
          id,
          title: String(questData.title || "New quest").slice(0, 60),
          progress: "0 / 1",
          xp: typeof questData.xp === "number" ? questData.xp : cadence === "daily" ? 75 : 180,
          done: false,
          cadence,
          missionType: questData.missionType || "focus",
          icon: questData.icon || null,
        };
        setQuests((prev) => [...prev, newQuest]);
        return newQuest;
      },
      completeQuest: (questId) => {
        setQuests((prev) =>
          prev.map((q) => (q.id !== questId || q.done ? q : { ...q, done: true, progress: "1 / 1" })),
        );
      },
      removeQuest: (questId) => {
        setQuests((prev) => prev.filter((q) => q.id !== questId));
      },
    };
  }, [xp, quests, recentRankUp, hydrated, auth0Id, displayName, streakDays, avatarId, avatarUrl, activeNotification]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

/** @returns {AppStateValue} */
export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
