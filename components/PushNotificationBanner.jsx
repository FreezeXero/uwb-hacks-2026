"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

export default function PushNotificationBanner({ notification, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (!notification) {
      setVisible(false);
      return;
    }
    setDismissing(false);
    // animate in next frame
    requestAnimationFrame(() => setVisible(true));

    const timer = setTimeout(() => {
      setDismissing(true);
      setTimeout(onDismiss, 300);
    }, 6000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div
      className="pointer-events-auto absolute left-3 right-3 top-[52px] z-50 transition-all duration-300"
      style={{
        opacity: visible && !dismissing ? 1 : 0,
        transform: `translateY(${visible && !dismissing ? "0" : "-12px"})`,
      }}
    >
      <div
        className="flex items-start gap-2.5 rounded-2xl border border-white/[0.12] p-3 backdrop-blur-2xl"
        style={{
          background: "rgba(28, 28, 32, 0.92)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-red-500">
          <Sparkles size={14} className="text-white" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold text-white">Ascend</p>
            <p className="text-[10px] text-zinc-500">now</p>
          </div>
          {notification.title && (
            <p className="text-[13px] font-semibold leading-tight text-white">
              {notification.title}
            </p>
          )}
          <p className="text-[12px] leading-snug text-zinc-300">
            {notification.body}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDismissing(true);
            setTimeout(onDismiss, 300);
          }}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-zinc-500 hover:bg-white/[0.05] hover:text-white"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
