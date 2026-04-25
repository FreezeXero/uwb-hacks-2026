"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "🏙️" },
  { href: "/quests", label: "Quests", icon: "⚡" },
  { href: "/friends", label: "Friends", icon: "🛰️" },
  { href: "/chatbot", label: "Chatbot", icon: "🤖" },
  { href: "/profile", label: "Profile", icon: "🧬" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-5 border-t border-white/10 bg-[#0f1117] px-1 py-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition ${
              isActive
                ? "bg-zinc-900 text-white shadow-[0_6px_18px_rgba(15,23,42,0.25)]"
                : "text-muted hover:bg-white/[0.04]"
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
