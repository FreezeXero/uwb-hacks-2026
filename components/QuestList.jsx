"use client";

import { useMemo, useState } from "react";
import { useAppState } from "./AppStateProvider";
import VerificationModal from "./VerificationModal";

export default function QuestList() {
  const { addXp, quests, addQuest, completeQuest } = useAppState();
  const [newQuest, setNewQuest] = useState("");
  const [selectedMissionType, setSelectedMissionType] = useState("focus");
  const [selectedCadence, setSelectedCadence] = useState("daily");
  const [verifyingQuest, setVerifyingQuest] = useState(null);

  const trimmedQuest = useMemo(() => newQuest.trim(), [newQuest]);
  const visibleQuests = useMemo(
    () => quests.filter((q) => q.cadence === selectedCadence),
    [quests, selectedCadence],
  );

  function handleAddQuest() {
    if (!trimmedQuest) return;
    addQuest({
      title: trimmedQuest,
      cadence: selectedCadence,
      missionType: selectedMissionType,
      xp: selectedCadence === "daily" ? 75 : 180,
    });
    setNewQuest("");
  }

  function openVerification(quest) {
    if (quest.done) return;
    setVerifyingQuest(quest);
  }

  function handleVerified(quest) {
    completeQuest(quest.id);
    addXp(quest.xp);
    setVerifyingQuest(null);
  }

  const missions = [
    { id: "focus", label: "Focus" },
    { id: "fitness", label: "Fitness" },
    { id: "wellness", label: "Wellness" },
  ];

  return (
    <>
      <section className="space-y-3">
        <div className="future-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Active Streak
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-white">
                8 <span className="text-base font-medium text-muted">days</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-xl">
              🔥
            </div>
          </div>

          <div className="divider-soft my-4" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Mission Type
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {missions.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMissionType(m.id)}
                className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                  selectedMissionType === m.id
                    ? "border border-orange-500/40 bg-orange-500/15 text-orange-300"
                    : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06]"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCadence("daily")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCadence === "daily"
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setSelectedCadence("weekly")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedCadence === "weekly"
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400"
              }`}
            >
              Weekly
            </button>
          </div>

          <div className="mt-3 flex gap-1.5">
            <input
              value={newQuest}
              onChange={(e) => setNewQuest(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddQuest()}
              placeholder="Add a new quest..."
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-muted focus:border-orange-500/40 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
            />
            <button type="button" onClick={handleAddQuest} className="future-button px-4 text-xs">
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {visibleQuests.map((quest) => (
            <article
              key={quest.id}
              className={`future-panel p-3.5 transition ${quest.done ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">{quest.title}</p>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                      {quest.cadence}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                    <span>{quest.progress}</span>
                    <span className="text-white/20">•</span>
                    <span className="font-semibold text-orange-400">+{quest.xp} XP</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openVerification(quest)}
                  disabled={quest.done}
                  className={
                    quest.done
                      ? "future-button-ghost px-3 py-1.5 text-xs"
                      : "future-button px-3 py-1.5 text-xs"
                  }
                >
                  {quest.done ? "✓ Done" : "Log"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {verifyingQuest && (
        <VerificationModal
          quest={verifyingQuest}
          onClose={() => setVerifyingQuest(null)}
          onVerified={handleVerified}
        />
      )}
    </>
  );
}
