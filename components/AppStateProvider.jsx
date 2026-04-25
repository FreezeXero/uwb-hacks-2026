"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "streakcard-app-state-v3";

const rankConfig = [
  { name: "Bronze", minXp: 0, color: "#cd7f32", glow: "rgba(205, 127, 50, 0.5)" },
  { name: "Silver", minXp: 500, color: "#c0c0c0", glow: "rgba(192, 192, 192, 0.5)" },
  { name: "Gold", minXp: 1500, color: "#fbbf24", glow: "rgba(251, 191, 36, 0.5)" },
  { name: "Platinum", minXp: 3500, color: "#7dd3fc", glow: "rgba(125, 211, 252, 0.5)" },
  { name: "Diamond", minXp: 7000, color: "#60a5fa", glow: "rgba(96, 165, 250, 0.6)" },
  { name: "Champion", minXp: 12000, color: "#a78bfa", glow: "rgba(167, 139, 250, 0.6)" },
  { name: "Grandmaster", minXp: 20000, color: "#f472b6", glow: "rgba(244, 114, 182, 0.6)" },
  { name: "Legendary", minXp: 35000, color: "#fb923c", glow: "rgba(251, 146, 60, 0.7)" },
];

const defaultQuests = [
  { id: "q-1", title: "Drink 2L water", progress: "0 / 1", xp: 60, done: false, cadence: "daily", missionType: "wellness" },
  { id: "q-2", title: "Read 20 minutes", progress: "0 / 1", xp: 80, done: false, cadence: "daily", missionType: "focus" },
  { id: "q-3", title: "Walk 8,000 steps", progress: "0 / 1", xp: 100, done: false, cadence: "daily", missionType: "fitness" },
  { id: "q-4", title: "Finish 5 workout sessions", progress: "0 / 5", xp: 250, done: false, cadence: "weekly", missionType: "fitness" },
  { id: "q-5", title: "No-sugar streak for 4 days", progress: "0 / 4", xp: 200, done: false, cadence: "weekly", missionType: "wellness" },
];

const AppStateContext = createContext(null);

function getRankFromXp(xp) {
  let active = rankConfig[0];
  for (const rank of rankConfig) {
    if (xp >= rank.minXp) {
      active = rank;
    }
  }
  return active;
}

function getNextRank(currentRankName) {
  const currentIndex = rankConfig.findIndex((r) => r.name === currentRankName);
  if (currentIndex === -1 || currentIndex === rankConfig.length - 1) {
    return null;
  }
  return rankConfig[currentIndex + 1];
}

export function AppStateProvider({ children }) {
  const [xp, setXp] = useState(6800);
  const [quests, setQuests] = useState(defaultQuests);
  const [recentRankUp, setRecentRankUp] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed.xp === "number" && parsed.xp >= 0) {
          setXp(parsed.xp);
        }
        if (Array.isArray(parsed.quests) && parsed.quests.length > 0) {
          setQuests(parsed.quests);
        }
      } catch {
        // Ignore malformed local storage values
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp, quests }));
  }, [xp, quests, hydrated]);

  const value = useMemo(() => {
    const currentRank = getRankFromXp(xp);
    const nextRank = getNextRank(currentRank.name);
    const xpToNext = nextRank ? nextRank.minXp - xp : 0;
    const xpInTier = nextRank ? xp - currentRank.minXp : 0;
    const tierSize = nextRank ? nextRank.minXp - currentRank.minXp : 1;
    const progressPct = nextRank
      ? Math.min(100, Math.max(0, (xpInTier / tierSize) * 100))
      : 100;

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
      clearRankUp: () => setRecentRankUp(null),
      addXp: (amount) => {
        const safeAmount = Math.max(0, amount);
        setXp((prev) => {
          const newXp = prev + safeAmount;
          const oldRank = getRankFromXp(prev);
          const newRank = getRankFromXp(newXp);
          if (oldRank.name !== newRank.name) {
            setRecentRankUp({
              from: oldRank.name,
              to: newRank.name,
              color: newRank.color,
              glow: newRank.glow,
            });
          }
          return newXp;
        });
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
        };
        setQuests((prev) => [...prev, newQuest]);
        return newQuest;
      },
      completeQuest: (questId) => {
        setQuests((prev) =>
          prev.map((q) => {
            if (q.id !== questId || q.done) return q;
            return { ...q, done: true, progress: "1 / 1" };
          }),
        );
      },
      removeQuest: (questId) => {
        setQuests((prev) => prev.filter((q) => q.id !== questId));
      },
    };
  }, [xp, quests, recentRankUp, hydrated]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
