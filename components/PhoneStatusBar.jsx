"use client";

export default function PhoneStatusBar() {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-[15px] z-40 hidden items-center justify-between px-14 sm:flex">
      <span className="text-[13px] font-semibold tabular-nums tracking-tight text-white">
        9:41
      </span>
      <div className="flex items-center gap-1.5">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <rect x="0.5" y="6.5" width="2.5" height="3.5" rx="0.5" fill="white" />
          <rect x="4.5" y="4.5" width="2.5" height="5.5" rx="0.5" fill="white" />
          <rect x="8.5" y="2.5" width="2.5" height="7.5" rx="0.5" fill="white" />
          <rect x="12.5" y="0.5" width="2.5" height="9.5" rx="0.5" fill="white" />
        </svg>

        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path
            d="M7 1C4.5 1 2.2 2 0.5 3.5l1.5 1.5C3.4 3.6 5.1 3 7 3s3.6.6 5 2l1.5-1.5C11.8 2 9.5 1 7 1z"
            fill="white"
          />
          <path
            d="M7 4.5c-1.5 0-2.8.6-3.8 1.5l1.5 1.5c.6-.6 1.4-1 2.3-1s1.7.4 2.3 1l1.5-1.5C9.8 5.1 8.5 4.5 7 4.5z"
            fill="white"
          />
          <circle cx="7" cy="8.5" r="1.3" fill="white" />
        </svg>

        <div className="ml-0.5 flex items-center">
          <div className="flex h-[11px] w-[22px] items-center rounded-[3px] border border-white/85 px-[1.5px]">
            <div className="h-[6px] w-full rounded-[1px] bg-white" />
          </div>
          <div className="ml-[1px] h-[5px] w-[1.5px] rounded-r-[1px] bg-white/85" />
        </div>
      </div>
    </div>
  );
}
