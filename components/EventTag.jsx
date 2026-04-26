"use client";

export default function EventTag({ label, color = "#fbbf24", size = "sm" }) {
  const padding =
    size === "lg" ? "px-3 py-1.5 text-[12px]" : "px-2.5 py-1 text-[10px]";

  return (
    <div
      className={`event-tag-glow inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider ${padding}`}
      style={{
        "--tag-color": color,
        background: `linear-gradient(135deg, ${color}28, ${color}10)`,
        borderColor: `${color}55`,
        color: color,
      }}
    >
      <span
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span>{label}</span>
    </div>
  );
}
