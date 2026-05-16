import { TeamBadge } from "./TeamBadge";

interface MatchupCardProps {
  opponent: string;
  games: number;
  avgPoints: number;
  oppColor?: string;
  oppLogoUrl?: string;
}

export function MatchupCard({
  opponent,
  games,
  avgPoints,
  oppColor,
  oppLogoUrl,
}: MatchupCardProps) {
  return (
    <div className="bg-[#0D1117] rounded-lg border border-white/5 p-3 flex items-center justify-between hover:border-white/10 transition-colors">
      <div className="flex items-center gap-2">
        <TeamBadge
          team={opponent}
          logoUrl={oppLogoUrl}
          color={oppColor}
          size="md"
        />
        <span className="text-sm font-medium">vs {opponent}</span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="text-center">
          <div className="text-muted-foreground">Games</div>
          <div className="font-bold font-mono">{games}</div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Avg Pts</div>
          <div className="font-bold font-mono text-[#00D4FF]">{avgPoints}</div>
        </div>
      </div>
    </div>
  );
}
