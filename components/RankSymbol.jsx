"use client";

// Custom geometric rank icons — no emoji, no letters
// Each rank gets a distinct symbol that scales with size

export default function RankSymbol({ rank, size = 28, color }) {
  const props = { size, color: color || "currentColor" };
  switch (rank) {
    case "Bronze":
      return <BronzeIcon {...props} />;
    case "Silver":
      return <SilverIcon {...props} />;
    case "Gold":
      return <GoldIcon {...props} />;
    case "Platinum":
      return <PlatinumIcon {...props} />;
    case "Diamond":
      return <DiamondIcon {...props} />;
    case "Champion":
      return <ChampionIcon {...props} />;
    case "Grandmaster":
      return <GrandmasterIcon {...props} />;
    case "Legendary":
      return <LegendaryIcon {...props} />;
    default:
      return <BronzeIcon {...props} />;
  }
}

// Bronze: single chevron
function BronzeIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 14L12 6L20 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Silver: double chevron
function SilverIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 11L12 3L20 11" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19L12 11L20 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Gold: triple chevron
function GoldIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M4 8L12 2L20 8" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 14L12 8L20 14" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20L12 14L20 20" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Platinum: outlined diamond
function PlatinumIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M7 12L12 7L17 12L12 17L7 12Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

// Diamond: filled diamond with inner facets
function DiamondIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M2 12L12 8L22 12" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 2L12 22" stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}

// Champion: shield with star
function ChampionIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 5V11C4 16 7.5 20 12 22C16.5 20 20 16 20 11V5L12 2Z"
        fill={color}
        fillOpacity="0.18"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 8L13.2 11L16.5 11.2L14 13.4L14.8 16.5L12 14.7L9.2 16.5L10 13.4L7.5 11.2L10.8 11L12 8Z"
        fill={color}
      />
    </svg>
  );
}

// Grandmaster: crown
function GrandmasterIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M3 18H21V20H3V18Z"
        fill={color}
      />
      <path
        d="M3 8L7 12L12 5L17 12L21 8V17H3V8Z"
        fill={color}
        fillOpacity="0.3"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="3" cy="8" r="1.5" fill={color} />
      <circle cx="21" cy="8" r="1.5" fill={color} />
      <circle cx="12" cy="5" r="1.5" fill={color} />
    </svg>
  );
}

// Legendary: starburst
function LegendaryIcon({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2L12 2Z"
        fill={color}
        fillOpacity="0.3"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11" r="1.5" fill={color} />
    </svg>
  );
}
