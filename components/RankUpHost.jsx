"use client";

import { useAppState } from "./AppStateProvider";
import RankUpCelebration from "./RankUpCelebration";

export default function RankUpHost() {
  const { recentRankUp, clearRankUp } = useAppState();

  if (!recentRankUp) return null;

  return <RankUpCelebration rankUp={recentRankUp} onClose={clearRankUp} />;
}
