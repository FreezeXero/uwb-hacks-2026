"use client";

import { useEffect, useRef, useState } from "react";
import { useAppState } from "./AppStateProvider";

const QUICK_PROMPTS = [
  "Help me plan a productive day",
  "Suggest 3 fitness quests",
  "I want to study more consistently",
  "I keep procrastinating, help",
];

export default function ChatbotInterface() {
  const { addQuest, xp, rank } = useAppState();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey, I'm your AI coach 🤖 I can suggest quests, help you plan your day, or just keep you accountable. What's on your mind?",
      suggestions: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedQuestIds, setAddedQuestIds] = useState(new Set());
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed, suggestions: null };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          userContext: { xp, rank },
        }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Coach is offline right now, try again in a sec.",
            suggestions: null,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message || "Got it.",
            suggestions: data.suggestions || null,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error, try again.",
          suggestions: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAddSuggestion(suggestion, suggestionKey) {
    addQuest({
      title: suggestion.title,
      cadence: suggestion.cadence,
      xp: suggestion.xp,
      missionType: suggestion.missionType,
    });
    setAddedQuestIds((prev) => new Set(prev).add(suggestionKey));
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={msg.role === "user" ? "max-w-[85%]" : "max-w-[90%] w-full"}>
              {msg.role === "assistant" && (
                <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                  🤖 Robot Coach
                </p>
              )}
              <div
                className={
                  msg.role === "user"
                    ? "rounded-2xl rounded-tr-md bg-orange-500/90 px-3.5 py-2.5 text-sm text-orange-950"
                    : "future-panel rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm text-white"
                }
              >
                {msg.content}
              </div>

              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.suggestions.map((s, sIdx) => {
                    const key = `${idx}-${sIdx}`;
                    const added = addedQuestIds.has(key);
                    return (
                      <div
                        key={key}
                        className="future-panel rounded-xl p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white">{s.title}</p>
                            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                                {s.cadence}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
                                {s.missionType}
                              </span>
                              <span className="font-semibold text-orange-400">+{s.xp} XP</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggestion(s, key)}
                            disabled={added}
                            className={
                              added
                                ? "future-button-ghost shrink-0 px-3 py-1.5 text-[11px]"
                                : "future-button shrink-0 px-3 py-1.5 text-[11px]"
                            }
                          >
                            {added ? "✓ Added" : "+ Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[90%]">
              <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                🤖 Robot Coach
              </p>
              <div className="future-panel rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts (only show when conversation is fresh) */}
      {messages.length <= 1 && !loading && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="flex gap-2 pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(input);
            }
          }}
          placeholder="Ask your coach anything..."
          disabled={loading}
          className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500/40 focus:outline-none focus:ring-1 focus:ring-orange-500/30 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="future-button shrink-0 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
