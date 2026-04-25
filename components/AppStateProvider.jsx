"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "streakcard-app-state-v1";

const rankConfig = [
  { name: "Bronze", minXp: 0 },
  { name: "Silver", minXp: 200 },
  { name: "Diamond", minXp: 500 },
  { name: "Champion", minXp: 900 },
  { name: "Grand Champion", minXp: 1400 },
  { name: "Legendary", minXp: 2200 },
];

const AppStateContext = createContext(null);

function getRankFromXp(xp) {
  let active = rankConfig[0];
  for (const rank of rankConfig) {
    if (xp >= rank.minXp) {
      active = rank;
    }
  }
  return active.name;
}

export function AppStateProvider({ children }) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.xp === "number" && parsed.xp >= 0) {
        setXp(parsed.xp);
      }
    } catch {
      // Ignore malformed local storage values and continue with defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp }));
  }, [xp]);

  const value = useMemo(
    () => ({
      xp,
      rank: getRankFromXp(xp),
      rankConfig,
      addXp: (amount) => setXp((prev) => prev + Math.max(0, amount)),
    }),
    [xp],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}
