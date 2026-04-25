type PlayerCardProps = {
  name: string;
  streak: number;
  goals: string[];
  badges: string[];
};

function getGlowClasses(streak: number): string {
  if (streak > 7) {
    return "shadow-[0_0_30px_rgba(249,115,22,0.55),0_0_60px_rgba(249,115,22,0.35)] ring-1 ring-orange-400/50";
  }

  if (streak >= 3) {
    return "shadow-[0_0_30px_rgba(59,130,246,0.5),0_0_60px_rgba(59,130,246,0.28)] ring-1 ring-blue-400/45";
  }

  return "ring-1 ring-white/10";
}

export default function PlayerCard({
  name,
  streak,
  goals,
  badges,
}: PlayerCardProps) {
  const glowClasses = getGlowClasses(streak);

  return (
    <section
      className={`w-full max-w-md rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 text-zinc-100 ${glowClasses}`}
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
            StreakCard
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">{name}</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-right backdrop-blur">
          <p className="text-xs uppercase tracking-widest text-zinc-400">
            Streak
          </p>
          <p className="text-2xl font-extrabold text-white">{streak}d</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm font-semibold text-zinc-300">Active Goals</p>
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li
              key={goal}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200"
            >
              {goal}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-zinc-300">Badges Earned</p>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-zinc-100"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
