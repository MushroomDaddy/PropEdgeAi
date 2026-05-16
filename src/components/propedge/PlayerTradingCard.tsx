/**
 * PlayerTradingCard — R13 Premium Visual
 *
 * Sports trading card style layout with holographic border effect,
 * team color gradients, headshot fallback, and key stats.
 */

import { motion } from "framer-motion";
import { Award, TrendingUp, Zap } from "lucide-react";
import {
  getPlayerInitials,
  getSportIcon,
  getTeamColors,
} from "../../lib/assets";

interface Props {
  playerName: string;
  team: string;
  position?: string;
  sport?: string;
  headshotUrl?: string;
  stats?: { label: string; value: string | number }[];
  edge?: number;
  confidence?: number;
  onClick?: () => void;
  compact?: boolean;
}

export function PlayerTradingCard({
  playerName,
  team,
  position,
  sport,
  headshotUrl,
  stats = [],
  edge,
  confidence,
  onClick,
  compact = false,
}: Props) {
  const colors = getTeamColors(team);
  const initials = getPlayerInitials(playerName);
  const sportIcon = getSportIcon(sport || "");

  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group cursor-pointer ${compact ? "w-44" : "w-56"}`}
      style={{ perspective: "1000px" }}
    >
      {/* Holographic border glow */}
      <div
        className="absolute -inset-[2px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.primary})`,
        }}
      />

      {/* Card body */}
      <div className="relative bg-[#0A0E17] rounded-2xl border border-white/10 overflow-hidden">
        {/* Team color header stripe */}
        <div
          className="h-24 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}CC, ${colors.secondary}99, ${colors.primary}66)`,
          }}
        >
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)",
            }}
          />

          {/* Sport icon watermark */}
          <span className="absolute top-2 right-3 text-2xl opacity-20">
            {sportIcon}
          </span>

          {/* Headshot / Initials */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            {headshotUrl ? (
              <img
                src={headshotUrl}
                alt={playerName}
                className="size-20 rounded-full border-4 border-[#0A0E17] object-cover shadow-xl"
              />
            ) : (
              <div
                className="size-20 rounded-full border-4 border-[#0A0E17] flex items-center justify-center text-xl font-black shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                }}
              >
                {initials}
              </div>
            )}
          </div>
        </div>

        {/* Player info */}
        <div className="pt-10 px-4 pb-4 text-center space-y-3">
          <div>
            <h3 className="font-black text-sm truncate">{playerName}</h3>
            <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1.5 mt-0.5">
              <span>{team}</span>
              {position && (
                <>
                  <span className="opacity-30">•</span>
                  <span>{position}</span>
                </>
              )}
            </div>
          </div>

          {/* Edge / Confidence pills */}
          {(edge !== undefined || confidence !== undefined) && (
            <div className="flex items-center justify-center gap-2">
              {edge !== undefined && (
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    edge > 0
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-red-400/10 text-red-400"
                  }`}
                >
                  <TrendingUp className="size-2.5" />
                  {edge > 0 ? "+" : ""}
                  {edge.toFixed(1)}%
                </div>
              )}
              {confidence !== undefined && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 text-[10px] font-bold">
                  <Zap className="size-2.5" />
                  {confidence}%
                </div>
              )}
            </div>
          )}

          {/* Stats grid */}
          {stats.length > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {stats.slice(0, 6).map((s, i) => (
                <div key={i} className="bg-white/5 rounded-lg px-2 py-1.5">
                  <div className="text-xs font-mono font-bold">{s.value}</div>
                  <div className="text-[8px] text-muted-foreground uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom accent */}
          <div className="flex items-center justify-center gap-1 pt-1">
            <Award className="size-3 text-amber-400/50" />
            <span className="text-[8px] text-muted-foreground tracking-wider uppercase">
              PropEdge AI
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
