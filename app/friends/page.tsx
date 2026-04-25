"use client";

import AppShell from "../../components/AppShell";
import { useMemo, useState } from "react";

const friends = [
  { id: "MAYA-2048", name: "Maya", streak: 12 },
  { id: "JORD-7781", name: "Jordan", streak: 10 },
  { id: "ARI-1023", name: "Ari", streak: 8 },
];

export default function FriendsPage() {
  const [searchId, setSearchId] = useState("");
  const [addedIds, setAddedIds] = useState([]);

  const filteredFriends = useMemo(() => {
    const query = searchId.trim().toUpperCase();
    if (!query) {
      return friends;
    }

    return friends.filter((friend) => friend.id.includes(query));
  }, [searchId]);

  function addFriendById(friendId) {
    setAddedIds((prev) => (prev.includes(friendId) ? prev : [...prev, friendId]));
  }

  return (
    <AppShell title="Friends" subtitle="Network leaderboard">
      <section className="space-y-3">
        <div className="future-panel rounded-2xl p-4">
          <p className="text-sm font-semibold text-white">Search friend by ID</p>
          <input
            value={searchId}
            onChange={(event) => setSearchId(event.target.value)}
            placeholder="e.g. MAYA-2048"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-zinc-400/60"
          />
        </div>

        {filteredFriends.map((friend, index) => (
          <article
            key={friend.id}
            className="future-panel flex items-center justify-between rounded-2xl p-4"
          >
            <div>
              <p className="font-semibold text-white">
                🛰️ #{index + 1} {friend.name}
              </p>
              <p className="text-sm text-muted">{friend.streak} day streak</p>
              <p className="text-xs text-muted">ID: {friend.id}</p>
            </div>
            <button
              type="button"
              onClick={() => addFriendById(friend.id)}
              className="future-button px-3 py-2 text-xs"
            >
              {addedIds.includes(friend.id) ? "Added" : "Add"}
            </button>
          </article>
        ))}

        {!filteredFriends.length ? (
          <p className="text-sm text-muted">No friend found for that ID.</p>
        ) : null}
      </section>
    </AppShell>
  );
}
