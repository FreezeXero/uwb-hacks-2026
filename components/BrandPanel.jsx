"use client";

export default function BrandPanel() {
  return (
    <aside className="brand-panel">
      <div className="text-right">
        <div className="flex items-center justify-end gap-4">
          <div className="text-right">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Built for UWB Hacks 2026
            </p>
            <h1 className="mt-2 text-[44px] font-black leading-none tracking-tight">
              <span className="bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Ascend
              </span>
            </h1>
          </div>
          <BrandMark />
        </div>
      </div>

      <div className="flex-1" />

      <div className="text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Discipline is a team sport
        </p>
        <p className="mt-2 text-[24px] font-bold leading-tight tracking-tight text-white">
          Ascend together.
        </p>
        <p className="mt-4 text-[10px] text-zinc-600">
          v0.1 · Next.js · Claude · Supabase
        </p>
      </div>
    </aside>
  );
}

function BrandMark() {
  return (
    <div className="brand-logo">
      <svg width="68" height="68" viewBox="0 0 56 56" fill="none">
        <defs>
          <linearGradient id="brand-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6ba4ff" />
            <stop offset="60%" stopColor="#4f8cff" />
            <stop offset="100%" stopColor="#2c6fe8" />
          </linearGradient>
          <linearGradient id="brand-grad-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r="26" fill="url(#brand-grad)" />
        <circle cx="28" cy="28" r="26" fill="url(#brand-grad-2)" />
        <path
          d="M14 36L28 22L42 36"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M14 30L28 16L42 30"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
