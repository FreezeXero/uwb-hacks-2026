"use client";

import { useState } from "react";
import { Calendar, Activity, Users, Globe } from "lucide-react";
import EventsPanel from "./EventsPanel";
import ActivityFeed from "./ActivityFeed";
import GlobalLeaderboard from "./GlobalLeaderboard";
import FriendsOnlyLeaderboard from "./FriendsOnlyLeaderboard";

export default function LivePageContent() {
  const [tab, setTab] = useState("events");

  const tabs = [
    { id: "events", label: "Events", Icon: Calendar },
    { id: "activity", label: "Activity", Icon: Activity },
    { id: "friends", label: "Friends", Icon: Users },
    { id: "global", label: "Global", Icon: Globe },
  ];

  return (
    <div className="space-y-3">
      <div className="future-panel grid grid-cols-4 gap-1 p-1">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[11px] font-semibold transition ${
                isActive
                  ? "bg-[var(--accent)] text-white shadow-md"
                  : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Icon size={12} strokeWidth={2.2} />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "events" && <EventsPanel />}
      {tab === "activity" && <ActivityFeed expanded />}
      {tab === "friends" && <FriendsOnlyLeaderboard />}
      {tab === "global" && <GlobalLeaderboard />}
    </div>
  );
}
