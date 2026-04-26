"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Plus } from "lucide-react";
import { useAppState } from "./AppStateProvider";

const QUICK_PROMPTS = [
  { label: "I want to study more", prompt: "I want to study more consistently for finals - give me 3 daily quests" },
  { label: "Build a side project", prompt: "I'm trying to build a side project. Suggest 3 weekly quests to keep momentum" },
  { label: "Get fit by summer", prompt: "I want to get in shape by summer. Give me 3 fitness quests, mix daily and weekly" },
  { label: "Reset my sleep", prompt: "My sleep is wrecked. Give me 2 daily quests to fix it" },
  { label: "Read more books", prompt: "I want to read 12 books this year. Suggest a daily and weekly quest" },
  { label: "Lock in for hack week", prompt: "It's UWB hack week. Give me 3 daily quests to ship hard" },
];

const SAMPLE_GREETING = `Hey, I'm your Ascend coach. Tell me what you're working toward and I'll suggest quests that fit. Or pick a starter below.`;

export default function ChatbotInterface() {
  const { addQuest, displayName } = useAppState();
  const [messages, setMessages] = useState(() => [
    { role: "assistant", text: SAMPLE_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const trimmed = useMemo(() => input.trim(), [input]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send(textArg) {
    const text = (textArg || trimmed).trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, displayName }),
      });

      const data = await res.json();
      const reply = data.reply || "Couldn't generate a response.";

      const quests = extractQuests(reply);
      const cleanedReply = stripJsonBlocks(reply);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: cleanedReply, suggestions: quests },
      ]);
    } catch (e) {
      setError(`Network error: ${e?.message || "couldn't reach the API"}`);
    } finally {
      setSending(false);
    }
  }

  function adoptQuest(suggestion, msgIndex, suggestionIndex) {
    addQuest({
      title: suggestion.title,
      cadence: suggestion.cadence === "weekly" ? "weekly" : "daily",
      missionType: suggestion.missionType || "focus",
    });
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i !== msgIndex || !m.suggestions) return m;
        return {
          ...m,
          suggestions: m.suggestions.map((s, si) =>
            si !== suggestionIndex ? s : { ...s, adopted: true },
          ),
        };
      }),
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-3">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            msg={msg}
            onAdopt={(suggestion, sIdx) => adoptQuest(suggestion, i, sIdx)}
          />
        ))}

        {messages.length === 1 && (
          <div className="space-y-2 pt-2">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Quick starters
            </p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => send(q.prompt)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] font-medium text-zinc-300 transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {sending && (
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: "120ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: "240ms" }} />
            </div>
            <p className="text-[12px] text-muted">Coach is thinking...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-[12px] text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-[var(--border)] pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask your coach..."
          className="w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[13px] text-white placeholder:text-zinc-500 focus:border-[var(--accent)]/40 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
        />
        <button
          onClick={() => send()}
          disabled={sending || !trimmed}
          className="future-button flex h-10 w-10 shrink-0 items-center justify-center disabled:opacity-50"
          aria-label="Send"
        >
          <Send size={14} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onAdopt }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-[var(--accent)] px-3.5 py-2 text-[13px] text-white">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
        <Sparkles size={13} className="text-white" strokeWidth={2.4} />
      </div>
      <div className="flex max-w-[85%] flex-col gap-2">
        <div className="rounded-2xl rounded-tl-md border border-white/[0.06] bg-[var(--surface)] px-3.5 py-2 text-[13px] leading-relaxed text-zinc-200 whitespace-pre-wrap">
          {msg.text}
        </div>
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="space-y-1.5">
            {msg.suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => !s.adopted && onAdopt(s, idx)}
                disabled={s.adopted}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                  s.adopted
                    ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-semibold text-white">{s.title}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted">
                    {s.cadence || "daily"} · {s.missionType || "focus"}
                  </p>
                </div>
                {s.adopted ? (
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Added
                  </span>
                ) : (
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                    <Plus size={9} strokeWidth={3} /> Add
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function extractQuests(reply) {
  const match = reply.match(/```json\s*([\s\S]*?)```/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.quests)) return parsed.quests;
    return [];
  } catch {
    return [];
  }
}

function stripJsonBlocks(reply) {
  return reply.replace(/```json\s*[\s\S]*?```/g, "").trim();
}
