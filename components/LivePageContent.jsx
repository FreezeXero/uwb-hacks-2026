"use client";

import { useState } from "react";
import { Calendar, Activity, Globe } from "lucide-react";
import EventsPanel from "./EventsPanel";
import ActivityFeed from "./ActivityFeed";
import GlobalLeaderboard from "./GlobalLeaderboard";

export default function LivePageContent() {
  const [tab, setTab] = useState("events");

  const tabs = [
    { id: "events", label: "Events", Icon: Calendar },
    { id: "activity", label: "Activity", Icon: Activity },
    { id: "global", label: "Global", Icon: Globe },
  ];

  return (
    <div className="space-y-3">
      {/* Sub-tabs */}
      <div className="future-panel grid grid-cols-3 gap-1 p-1">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[12px] font-semibold transition ${
                isActive
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={13} strokeWidth={2.2} />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "events" && <EventsPanel />}
      {tab === "activity" && <ActivityFeed expanded />}
      {tab === "global" && <GlobalLeaderboard />}
    </div>
  );
}
