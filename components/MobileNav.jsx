"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Users, Sparkles, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/quests", label: "Quests", Icon: Target },
  { href: "/friends", label: "Friends", Icon: Users },
  { href: "/chatbot", label: "Coach", Icon: Sparkles },
  { href: "/profile", label: "Profile", Icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="border-t border-[var(--border)] bg-[var(--background)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {TABS.map(({ href, label, Icon }) => {
          const isActive =
            pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <Icon
                size={22}
                className={isActive ? "text-[var(--accent)]" : "text-zinc-500"}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              <span
                className={`text-[10px] font-medium tracking-tight ${
                  isActive ? "text-[var(--accent)]" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
