"use client";

import { useMemo, useState } from "react";
import {
  Code,
  BookOpen,
  Book,
  Dumbbell,
  Moon,
  Brain,
  Apple,
  Droplet,
  Footprints,
  Sparkles,
  Target,
} from "lucide-react";
import { useAppState } from "./AppStateProvider";
import VerificationModal from "./VerificationModal";

const iconMap = {
  code: Code,
  book: Book,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  moon: Moon,
  brain: Brain,
  apple: Apple,
  droplet: Droplet,
  footprints: Footprints,
};

function QuestIcon({ icon, missionType, size = 16 }) {
  const Icon = iconMap[icon] || (
    missionType === "fitness"
      ? Dumbbell
      : missionType === "wellness"
      ? Apple
      : Target
  );
  const tint =
    missionType === "fitness"
      ? "#ff8a3d"
      : missionType === "wellness"
      ? "#10b981"
      : "#4f8cff";
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
      style={{
        background: `${tint}1f`,
        border: `1px solid ${tint}33`,
      }}
    >
      <Icon size={size} style={{ color: tint }} strokeWidth={2.2} />
    </div>
  );
}

export default function QuestList() {
  const { addXp, quests, addQuest, completeQuest, multiplier } = useAppState();
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
          {multiplier > 1 && (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-[var(--warm-soft)] px-3 py-2">
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-[var(--warm)]" strokeWidth={2.4} />
                <p className="text-[12px] font-semibold text-white">
                  {multiplier}× XP active
                </p>
              </div>
              <p className="text-[11px] text-muted">From your streak</p>
            </div>
          )}

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
                    ? "border border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--accent)]"
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
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-muted focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
            />
            <button
              type="button"
              onClick={handleAddQuest}
              className="future-button px-4 text-xs"
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {visibleQuests.map((quest) => (
            <article
              key={quest.id}
              className={`future-panel p-3 transition ${quest.done ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <QuestIcon icon={quest.icon} missionType={quest.missionType} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-white">
                    {quest.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                      {quest.cadence}
                    </span>
                    <span className="text-[11px] font-semibold text-[var(--accent)]">
                      +{Math.round(quest.xp * multiplier)} XP
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openVerification(quest)}
                  disabled={quest.done}
                  className={
                    quest.done
                      ? "future-button-ghost px-3 py-2 text-[12px]"
                      : "future-button px-3 py-2 text-[12px]"
                  }
                >
                  {quest.done ? "Done" : "Log"}
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
