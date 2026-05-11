import { cn } from "@/lib/utils";
import { User, Flame, Snowflake, Heart, AlertTriangle, Zap } from "lucide-react";
import { DataSourceBadge } from "./Badges";

// Team color accents (expandable)
const TEAM_COLORS: Record<string, string> = {
  "Dallas Mavericks": "#0064B1",
  "Denver Nuggets": "#0E2240",
  "Milwaukee Bucks": "#00471B",
  "Los Angeles Lakers": "#552583",
  "Boston Celtics": "#007A33",
  "Miami Heat": "#98002E",
  "Golden State Warriors": "#1D428A",
  "Phoenix Suns": "#1D1160",
  "Philadelphia 76ers": "#006BB6",
  "New York Knicks": "#F58426",
  "Brooklyn Nets": "#000000",
  "Atlanta Braves": "#CE1141",
  "NY Yankees": "#003087",
  "Kansas City Chiefs": "#E31837",
  "Buffalo Bills": "#00338D",
  "San Francisco 49ers": "#AA0000",
};

interface PlayerHeroCardProps {
  name: string;
  team: string;
  position: string;
  sport: string;
  injuryStatus?: string;
  recentForm?: string;
  imageUrl?: string;
  teamLogoUrl?: string;
  jerseyNumber?: number;
  teamColor?: string;
  dataSource?: string;
}

export function PlayerHeroCard({ name, team, position, sport, injuryStatus, recentForm, imageUrl, teamLogoUrl, jerseyNumber, teamColor: teamColorProp, dataSource = "demo" }: PlayerHeroCardProps) {
  const teamColor = teamColorProp || TEAM_COLORS[team] || "#6366f1";
  const isHealthy = !injuryStatus || injuryStatus === "Active" || injuryStatus === "healthy";
  const isHot = recentForm === "hot" || recentForm === "🔥";

  return (
    <div className="relative rounded-2xl border border-white/10 overflow-hidden">
      {/* Gradient background with team color */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${teamColor}44 0%, transparent 50%, ${teamColor}22 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-card/80 via-card/60 to-transparent" />

      <div className="relative flex items-center gap-6 p-6">
        {/* Player avatar / headshot placeholder */}
        <div
          className="size-24 rounded-2xl border-2 flex items-center justify-center shrink-0"
          style={{
            borderColor: `${teamColor}66`,
            background: `linear-gradient(135deg, ${teamColor}22, ${teamColor}08)`,
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="size-full rounded-2xl object-cover" />
          ) : jerseyNumber !== undefined ? (
            <span className="text-2xl font-black text-white/40 font-mono">#{jerseyNumber}</span>
          ) : (
            <User className="size-10 text-white/30" />
          )}
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold truncate">{name}</h2>
            <DataSourceBadge source={dataSource} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            {/* Team logo */}
            {teamLogoUrl ? (
              <img src={teamLogoUrl} alt={team} className="size-5 rounded object-contain" />
            ) : (
              <div
                className="size-5 rounded border flex items-center justify-center text-[8px] font-bold"
                style={{ borderColor: `${teamColor}44`, background: `${teamColor}22`, color: teamColor }}
              >
                {team.split(" ").pop()?.substring(0, 3).toUpperCase()}
              </div>
            )}
            <span className="font-medium">{team}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{position}</span>
            <span className="text-muted-foreground/40">·</span>
            <span>{sport}</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Health */}
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium border",
              isHealthy
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : injuryStatus === "GTD"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {isHealthy ? <Heart className="size-3" /> : <AlertTriangle className="size-3" />}
              {isHealthy ? "Healthy" : injuryStatus}
            </span>

            {/* Form */}
            {recentForm && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium border",
                isHot
                  ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              )}>
                {isHot ? <Flame className="size-3" /> : <Snowflake className="size-3" />}
                {isHot ? "Hot Streak" : recentForm}
              </span>
            )}
          </div>
        </div>

        {/* Decorative element */}
        <div className="hidden lg:flex flex-col items-center gap-1 text-muted-foreground/20">
          <Zap className="size-12" />
        </div>
      </div>
    </div>
  );
}
