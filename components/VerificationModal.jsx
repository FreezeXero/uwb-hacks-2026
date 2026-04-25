"use client";

import { useEffect, useState } from "react";

export default function VerificationModal({ quest, onClose, onVerified }) {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | failure
  const [reason, setReason] = useState("");

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && status !== "loading") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, status]);

  async function handleSubmit() {
    if (!response.trim() || status === "loading") return;

    setStatus("loading");
    setReason("");

    try {
      const res = await fetch("/api/verify-quest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questTitle: quest.title,
          userResponse: response.trim(),
        }),
      });

      const data = await res.json();

      if (data.verified) {
        setStatus("success");
        setReason(data.reason || "Quest verified!");
        // Wait a beat so user sees the success state, then commit XP and close
        setTimeout(() => {
          onVerified(quest);
        }, 1400);
      } else {
        setStatus("failure");
        setReason(data.reason || "Verification failed, try again with more detail");
      }
    } catch (error) {
      console.error(error);
      setStatus("failure");
      setReason("Network error, try again");
    }
  }

  function handleRetry() {
    setStatus("idle");
    setReason("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={status === "loading" ? undefined : onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="future-panel w-full max-w-md p-5 sm:rounded-2xl"
        style={{
          borderRadius: "1.25rem 1.25rem 0 0",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              AI Verification
            </p>
            <p className="mt-1 truncate text-base font-bold text-white">{quest.title}</p>
          </div>
          <span className="ml-3 shrink-0 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-orange-300">
            +{quest.xp} XP
          </span>
        </div>

        <div className="divider-soft my-4" />

        {/* Idle state: input form */}
        {status === "idle" && (
          <>
            <p className="text-sm text-muted">
              Describe what you actually did. Be specific. Vague answers don&apos;t count.
            </p>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              autoFocus
              rows={4}
              placeholder="e.g. Studied chapter 4 of CSS 342, took notes on stack vs heap memory and pointer arithmetic..."
              className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500/40 focus:outline-none focus:ring-1 focus:ring-orange-500/30"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="future-button-ghost flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!response.trim()}
                className="future-button flex-1 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Verify Quest
              </button>
            </div>
          </>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="flex h-12 w-12 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500/30 border-t-orange-500" />
            </div>
            <p className="text-sm font-semibold text-white">AI Coach is verifying...</p>
            <p className="text-xs text-muted">Analyzing your response</p>
          </div>
        )}

        {/* Success state */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15 text-2xl">
              ✓
            </div>
            <p className="text-base font-bold text-emerald-400">Verified!</p>
            <p className="text-center text-xs text-muted">{reason}</p>
            <p className="mt-1 text-xs font-bold text-orange-400">+{quest.xp} XP earned</p>
          </div>
        )}

        {/* Failure state */}
        {status === "failure" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/40 bg-red-500/15 text-2xl">
              ✕
            </div>
            <p className="text-base font-bold text-red-400">Not enough detail</p>
            <p className="text-center text-xs text-muted">{reason}</p>
            <div className="mt-3 flex w-full gap-2">
              <button
                type="button"
                onClick={onClose}
                className="future-button-ghost flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="future-button flex-1 py-2.5 text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
