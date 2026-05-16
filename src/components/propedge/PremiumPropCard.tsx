import { formatDirection, formatLabel } from "@/lib/labels";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { EdgeMeter } from "./EdgeMeter";
import { RiskMeter } from "./RiskMeter";
import { TeamBadge } from "./TeamBadge";

interface PremiumPropCardProps {
  playerName: string;
  team: string;
  teamColor?: string;
  teamLogoUrl?: string;
  imageUrl?: string;
  statType: string;
  line: number;
  projection: number;
  edge: number;
  overUnder: string;
  confidence: number;
  bustRisk?: number;
  hitRate: number;
  platform: string;
  modelProb?: number;
  onClick?: () => void;
}

export function PremiumPropCard(props: PremiumPropCardProps) {
  const {
    playerName,
    team,
    teamColor,
    teamLogoUrl,
    imageUrl,
    statType,
    line,
    projection,
    edge,
    overUnder,
    confidence,
    bustRisk,
    hitRate,
    platform,
    modelProb,
    onClick,
  } = props;

  const edgeColor = edge > 0 ? "border-emerald-500/30" : "border-red-500/30";
  const dirLabel = formatDirection(overUnder).toUpperCase();
  const dirColor = overUnder === "over" ? "text-emerald-400" : "text-red-400";

  return (
    <div
      className={`group relative bg-[#0D1117] rounded-xl border ${edgeColor} hover:border-[#00D4FF]/40 transition-all cursor-pointer overflow-hidden`}
      onClick={onClick}
    >
      {/* Team color accent bar */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: teamColor || "#333" }}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={playerName}
                className="size-10 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-muted-foreground">
                {playerName
                  .split(" ")
                  .map(n => n[0])
                  .join("")}
              </div>
            )}
            <div>
              <div className="font-semibold text-sm">{playerName}</div>
              <TeamBadge team={team} logoUrl={teamLogoUrl} color={teamColor} />
            </div>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${dirColor} ${overUnder === "over" ? "bg-emerald-400/10" : "bg-red-400/10"}`}
          >
            {dirLabel}
          </span>
        </div>

        {/* Stat line */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-muted-foreground text-xs">
              {formatLabel(statType)}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono">{line}</span>
              <span className="text-xs text-muted-foreground">
                → {projection}
              </span>
            </div>
          </div>
          {modelProb !== undefined && (
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground">Model</span>
              <div className="text-lg font-bold font-mono text-[#00D4FF]">
                {modelProb}%
              </div>
            </div>
          )}
        </div>

        {/* Edge meter */}
        <EdgeMeter edge={edge} />

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <ConfidenceMeter confidence={confidence} compact />
          <RiskMeter risk={bustRisk ?? 50} />
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">{platform}</div>
            <div className="text-xs font-mono">{hitRate}% hit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
