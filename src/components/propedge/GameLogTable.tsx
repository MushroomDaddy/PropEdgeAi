import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface GameLog {
  gameDate: number;
  opponent: string;
  homeAway: string;
  points?: number;
  rebounds?: number;
  assists?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  threePointers?: number;
  minutes?: number;
  fg?: string;
  hits?: number;
  rbi?: number;
  runs?: number;
  goals?: number;
  shotsOnGoal?: number;
  saves?: number;
}

interface GameLogTableProps {
  logs: GameLog[];
  sport: string;
  /** Optional: show hit/miss indicators for a particular stat/line */
  hitConfig?: { statField: string; line: number; overUnder: string };
  initialShow?: number;
}

export function GameLogTable({ logs, sport, hitConfig, initialShow = 10 }: GameLogTableProps) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? logs : logs.slice(0, initialShow);

  const getStatValue = (log: GameLog, field: string): number | undefined => {
    const map: Record<string, keyof GameLog> = {
      points: "points", rebounds: "rebounds", assists: "assists",
      threePointers: "threePointers", steals: "steals", blocks: "blocks",
      turnovers: "turnovers", minutes: "minutes", hits: "hits",
      rbi: "rbi", runs: "runs", goals: "goals", shotsOnGoal: "shotsOnGoal", saves: "saves",
    };
    const key = map[field];
    return key ? (log[key] as number | undefined) : undefined;
  };

  const isHit = (log: GameLog): boolean | null => {
    if (!hitConfig) return null;
    const val = getStatValue(log, hitConfig.statField);
    if (val === undefined) return null;
    return hitConfig.overUnder === "over" ? val > hitConfig.line : val < hitConfig.line;
  };

  return (
    <div className="rounded-xl border border-white/5 bg-card/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold">Game Log</h3>
        {logs.length > initialShow && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            {showAll ? "Show Less" : `Show All (${logs.length})`}
            {showAll ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted-foreground/60 uppercase text-[10px] tracking-wider">
              {hitConfig && <th className="px-3 py-2.5 w-8" />}
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5">Opp</th>
              <th className="px-3 py-2.5 w-8">H/A</th>
              {sport === "NBA" && (<>
                <th className="px-3 py-2.5 text-right">MIN</th>
                <th className="px-3 py-2.5 text-right font-semibold text-foreground/80">PTS</th>
                <th className="px-3 py-2.5 text-right">REB</th>
                <th className="px-3 py-2.5 text-right">AST</th>
                <th className="px-3 py-2.5 text-right">STL</th>
                <th className="px-3 py-2.5 text-right">BLK</th>
                <th className="px-3 py-2.5 text-right">TO</th>
                <th className="px-3 py-2.5 text-right">3PM</th>
                <th className="px-3 py-2.5 text-right">FG</th>
              </>)}
              {sport === "MLB" && (<>
                <th className="px-3 py-2.5 text-right">H</th>
                <th className="px-3 py-2.5 text-right">RBI</th>
                <th className="px-3 py-2.5 text-right">R</th>
              </>)}
              {sport === "NHL" && (<>
                <th className="px-3 py-2.5 text-right">G</th>
                <th className="px-3 py-2.5 text-right">SOG</th>
                <th className="px-3 py-2.5 text-right">SVS</th>
              </>)}
            </tr>
          </thead>
          <tbody>
            {displayed.map((log, i) => {
              const hit = isHit(log);
              return (
                <tr key={i} className={cn(
                  "border-b border-white/[0.03] transition-colors hover:bg-white/[0.03]",
                  hit === true && "bg-emerald-500/[0.03]",
                  hit === false && "bg-red-500/[0.03]",
                )}>
                  {hitConfig && (
                    <td className="px-3 py-2">
                      {hit === true ? <CheckCircle2 className="size-3.5 text-emerald-400" /> :
                       hit === false ? <XCircle className="size-3.5 text-red-400" /> : null}
                    </td>
                  )}
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(log.gameDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-3 py-2 font-medium">{log.opponent}</td>
                  <td className="px-3 py-2">
                    <span className={cn(
                      "text-[10px] px-1 py-0.5 rounded",
                      log.homeAway === "home" ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400",
                    )}>
                      {log.homeAway === "home" ? "H" : "A"}
                    </span>
                  </td>
                  {sport === "NBA" && (<>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{log.minutes ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold">{log.points ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{log.rebounds ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{log.assists ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{log.steals ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{log.blocks ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{log.turnovers ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{log.threePointers ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-muted-foreground">{log.fg ?? "—"}</td>
                  </>)}
                  {sport === "MLB" && (<>
                    <td className="px-3 py-2 text-right font-mono">{log.hits ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{log.rbi ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{log.runs ?? "—"}</td>
                  </>)}
                  {sport === "NHL" && (<>
                    <td className="px-3 py-2 text-right font-mono">{log.goals ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{log.shotsOnGoal ?? "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{log.saves ?? "—"}</td>
                  </>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
