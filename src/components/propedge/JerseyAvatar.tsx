/**
 * JerseyAvatar — R13 Premium Visual
 *
 * Jersey-shaped avatar with team colors and player number.
 * Used in tables and compact lists as an alternative to headshots.
 */

import { getTeamColors } from "../../lib/assets";

interface Props {
  playerName: string;
  team?: string;
  number?: number | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { w: "w-7", h: "h-8", text: "text-[9px]", name: "text-[7px]" },
  md: { w: "w-10", h: "h-11", text: "text-xs", name: "text-[8px]" },
  lg: { w: "w-14", h: "h-16", text: "text-base", name: "text-[10px]" },
};

export function JerseyAvatar({
  playerName,
  team,
  number,
  size = "md",
  className = "",
}: Props) {
  const colors = getTeamColors(team || "");
  const s = SIZES[size];
  const lastName = playerName.split(" ").pop() || "";

  return (
    <div
      className={`${s.w} ${s.h} relative flex flex-col items-center justify-center ${className}`}
    >
      {/* Jersey shape */}
      <svg viewBox="0 0 40 48" className="absolute inset-0 w-full h-full">
        <path
          d="M8 0 L0 12 L4 14 L4 48 L36 48 L36 14 L40 12 L32 0 Z"
          fill={colors.primary}
          opacity={0.85}
        />
        <path
          d="M8 0 L0 12 L4 14 L4 48 L36 48 L36 14 L40 12 L32 0 Z"
          fill="none"
          stroke={colors.secondary}
          strokeWidth={1.5}
          opacity={0.5}
        />
        {/* Collar */}
        <path
          d="M14 0 Q20 6 26 0"
          fill="none"
          stroke={colors.secondary}
          strokeWidth={1.5}
          opacity={0.6}
        />
      </svg>

      {/* Number */}
      <span className={`${s.text} font-black text-white/90 relative z-10 mt-1`}>
        {number ?? ""}
      </span>

      {/* Name under jersey */}
      <span
        className={`${s.name} text-muted-foreground truncate max-w-full relative z-10 mt-0.5`}
      >
        {lastName.substring(0, 6)}
      </span>
    </div>
  );
}
