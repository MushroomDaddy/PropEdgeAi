import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft, Radio, Clock, Users, BarChart3, Activity, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type PlayByPlayEntry = {
  time: string;
  quarter: string;
  description: string;
  team: string;
  type: string;
  points?: number;
};

type BoxScorePlayer = {
  name: string;
  position: string;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fg: string;
  threePt: string;
  ft: string;
  plusMinus: number;
};

type OutPlayer = {
  name: string;
  reason: string;
};

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"playbyplay" | "boxscore" | "props" | "roster">("playbyplay");

  const game = useQuery(api.gameDetail.getGame, gameId ? { gameId: gameId as any } : "skip");
  const gameProps = useQuery(api.gameDetail.getGameProps, gameId ? { gameId: gameId as any } : "skip");

  if (!game) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading game...</div>
      </div>
    );
  }

  const homeShort = game.homeTeam.split(" ").pop() || game.homeTeam;
  const awayShort = game.awayTeam.split(" ").pop() || game.awayTeam;
  const isLive = game.status === "live";

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
      {/* Back nav */}
      <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="size-4" /> Back
      </Button>

      {/* Game Header */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-transparent to-primary/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-xs font-bold text-red-400">
                  <Radio className="size-3 animate-pulse" /> LIVE
                </span>
              )}
              {game.quarter && (
                <span className="rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                  {game.quarter} {game.gameClock}
                </span>
              )}
              {!isLive && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(game.gameTime).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </div>
            {game.broadcast && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">{game.broadcast}</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 md:gap-12">
            {/* Away team */}
            <div className="text-center space-y-1 flex-1">
              <div className="text-3xl md:text-5xl font-black tabular-nums">
                {game.awayScore ?? "—"}
              </div>
              <div className="text-sm md:text-lg font-bold">{game.awayTeam}</div>
              <div className="text-xs text-muted-foreground">AWAY</div>
            </div>

            <div className="text-xl md:text-2xl font-bold text-muted-foreground/50">VS</div>

            {/* Home team */}
            <div className="text-center space-y-1 flex-1">
              <div className="text-3xl md:text-5xl font-black tabular-nums">
                {game.homeScore ?? "—"}
              </div>
              <div className="text-sm md:text-lg font-bold">{game.homeTeam}</div>
              <div className="text-xs text-muted-foreground">HOME</div>
            </div>
          </div>

          {game.venue && (
            <div className="text-center mt-4 text-xs text-muted-foreground">{game.venue}</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border/50 bg-card/30 p-1">
        {[
          { key: "playbyplay" as const, label: "Play-by-Play", icon: Activity },
          { key: "boxscore" as const, label: "Box Score", icon: BarChart3 },
          { key: "props" as const, label: `Props (${gameProps?.length ?? 0})`, icon: BarChart3 },
          { key: "roster" as const, label: "Roster", icon: Users },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <tab.icon className="size-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "playbyplay" && <PlayByPlayTab plays={game.playByPlay || []} homeTeam={game.homeTeam} homeShort={homeShort} awayShort={awayShort} />}
      {activeTab === "boxscore" && <BoxScoreTab boxScore={game.boxScore} homeTeam={game.homeTeam} awayTeam={game.awayTeam} />}
      {activeTab === "props" && <PropsTab props={gameProps || []} />}
      {activeTab === "roster" && <RosterTab roster={game.roster} homeTeam={game.homeTeam} awayTeam={game.awayTeam} />}
    </div>
  );
}

function PlayByPlayTab({ plays, homeTeam, homeShort, awayShort }: { plays: PlayByPlayEntry[]; homeTeam: string; homeShort: string; awayShort: string }) {
  if (!plays || plays.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center text-muted-foreground">
        <Activity className="size-12 mx-auto mb-3 opacity-30" />
        <p>Play-by-play not available yet</p>
        <p className="text-xs mt-1">Data will appear once the game starts</p>
      </div>
    );
  }

  // Group by quarter
  const quarters = plays.reduce((acc, play) => {
    if (!acc[play.quarter]) acc[play.quarter] = [];
    acc[play.quarter].push(play);
    return acc;
  }, {} as Record<string, PlayByPlayEntry[]>);

  // Reverse order: most recent quarter first
  const quarterKeys = Object.keys(quarters).sort().reverse();

  return (
    <div className="space-y-4">
      {quarterKeys.map((q) => (
        <div key={q} className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <div className="px-4 py-2 bg-muted/30 border-b border-border/30">
            <span className="text-sm font-bold text-primary">{q}</span>
          </div>
          <div className="divide-y divide-border/20">
            {quarters[q].map((play, i) => {
              const isHome = play.team === homeTeam;
              const isScore = play.type === "score";
              const isTurnover = play.type === "turnover";
              const isFoul = play.type === "foul";
              const isTimeout = play.type === "timeout";

              return (
                <div key={i} className={`flex items-start gap-3 px-4 py-3 ${isScore ? "bg-primary/5" : ""}`}>
                  {/* Time */}
                  <span className="text-xs text-muted-foreground font-mono w-12 shrink-0 pt-0.5">{play.time}</span>

                  {/* Team indicator */}
                  <span className={`text-xs font-bold w-10 shrink-0 pt-0.5 ${isHome ? "text-green-400" : "text-blue-400"}`}>
                    {isHome ? homeShort : awayShort}
                  </span>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm ${isScore ? "font-semibold text-foreground" : isTurnover ? "text-red-400" : isFoul ? "text-yellow-400" : isTimeout ? "text-muted-foreground italic" : "text-foreground/80"}`}>
                      {play.description}
                    </span>
                  </div>

                  {/* Points badge */}
                  {isScore && play.points && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                      play.points === 3 ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
                      play.points === 2 ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                    }`}>
                      +{play.points}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BoxScoreTab({ boxScore, homeTeam, awayTeam }: { boxScore?: { home: BoxScorePlayer[]; away: BoxScorePlayer[] }; homeTeam: string; awayTeam: string }) {
  if (!boxScore) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center text-muted-foreground">
        <BarChart3 className="size-12 mx-auto mb-3 opacity-30" />
        <p>Box score not available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TeamBoxScore teamName={homeTeam} players={boxScore.home} label="HOME" />
      <TeamBoxScore teamName={awayTeam} players={boxScore.away} label="AWAY" />
    </div>
  );
}

function TeamBoxScore({ teamName, players, label }: { teamName: string; players: BoxScorePlayer[]; label: string }) {
  const teamTotals = players.reduce(
    (acc, p) => ({
      points: acc.points + p.points,
      rebounds: acc.rebounds + p.rebounds,
      assists: acc.assists + p.assists,
      steals: acc.steals + p.steals,
      blocks: acc.blocks + p.blocks,
    }),
    { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0 }
  );

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border/30 flex items-center justify-between">
        <div>
          <span className="font-bold">{teamName}</span>
          <span className="ml-2 text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="text-xs text-muted-foreground space-x-3">
          <span>{teamTotals.points} PTS</span>
          <span>{teamTotals.rebounds} REB</span>
          <span>{teamTotals.assists} AST</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/30 text-muted-foreground">
              <th className="text-left px-3 py-2 font-medium sticky left-0 bg-card/80">Player</th>
              <th className="px-2 py-2 font-medium text-center">MIN</th>
              <th className="px-2 py-2 font-medium text-center">PTS</th>
              <th className="px-2 py-2 font-medium text-center">REB</th>
              <th className="px-2 py-2 font-medium text-center">AST</th>
              <th className="px-2 py-2 font-medium text-center">STL</th>
              <th className="px-2 py-2 font-medium text-center">BLK</th>
              <th className="px-2 py-2 font-medium text-center">TO</th>
              <th className="px-2 py-2 font-medium text-center">FG</th>
              <th className="px-2 py-2 font-medium text-center">3PT</th>
              <th className="px-2 py-2 font-medium text-center">FT</th>
              <th className="px-2 py-2 font-medium text-center">+/-</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={i} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                <td className="px-3 py-2 sticky left-0 bg-card/80">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground">{p.position}</div>
                </td>
                <td className="px-2 py-2 text-center text-muted-foreground">{p.minutes}</td>
                <td className={`px-2 py-2 text-center font-bold ${p.points >= 20 ? "text-primary" : ""}`}>{p.points}</td>
                <td className={`px-2 py-2 text-center ${p.rebounds >= 8 ? "text-blue-400" : ""}`}>{p.rebounds}</td>
                <td className={`px-2 py-2 text-center ${p.assists >= 5 ? "text-purple-400" : ""}`}>{p.assists}</td>
                <td className="px-2 py-2 text-center">{p.steals}</td>
                <td className="px-2 py-2 text-center">{p.blocks}</td>
                <td className="px-2 py-2 text-center text-red-400/70">{p.turnovers}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{p.fg}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{p.threePt}</td>
                <td className="px-2 py-2 text-center text-muted-foreground">{p.ft}</td>
                <td className={`px-2 py-2 text-center font-medium ${p.plusMinus > 0 ? "text-green-400" : p.plusMinus < 0 ? "text-red-400" : ""}`}>
                  {p.plusMinus > 0 ? `+${p.plusMinus}` : p.plusMinus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PropsTab({ props }: { props: Array<Record<string, unknown>> }) {
  if (props.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center text-muted-foreground">
        <BarChart3 className="size-12 mx-auto mb-3 opacity-30" />
        <p>No props available for this game</p>
      </div>
    );
  }

  // Group by propType
  const grouped: Record<string, typeof props> = {};
  for (const p of props) {
    const type = (p.propType as string) || "over_under";
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(p);
  }

  const typeLabels: Record<string, string> = {
    over_under: "📊 Over/Under",
    moneyline: "💰 Moneylines",
    spread: "📏 Spreads",
    total: "🎯 Game Totals",
    first_scorer: "⚡ Scorer Props",
    alt_line: "🔄 Alt Lines",
    player_special: "🌟 Player Specials",
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, typeProps]) => (
        <div key={type} className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
          <div className="px-4 py-2 bg-muted/30 border-b border-border/30">
            <span className="text-sm font-bold">{typeLabels[type] || type}</span>
            <span className="ml-2 text-xs text-muted-foreground">({typeProps.length})</span>
          </div>
          <div className="divide-y divide-border/10">
            {typeProps.map((p, i) => {
              const edge = p.edge as number;
              const isPositive = edge > 0;
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/10 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{p.playerName as string}</div>
                    <div className="text-xs text-muted-foreground">{p.statType as string} • {p.platform as string}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">
                      Line: {p.line as number} → Proj: {p.projection as number}
                    </div>
                    <div className={`text-sm font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
                      {isPositive ? "+" : ""}{edge}% edge
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                    isPositive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {(p.overUnder as string).toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function RosterTab({ roster, homeTeam, awayTeam }: { roster?: { home: { active: string[]; out: OutPlayer[] }; away: { active: string[]; out: OutPlayer[] } }; homeTeam: string; awayTeam: string }) {
  if (!roster) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/30 p-8 text-center text-muted-foreground">
        <Users className="size-12 mx-auto mb-3 opacity-30" />
        <p>Roster information not available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TeamRoster teamName={homeTeam} roster={roster.home} label="HOME" />
      <TeamRoster teamName={awayTeam} roster={roster.away} label="AWAY" />
    </div>
  );
}

function TeamRoster({ teamName, roster, label }: { teamName: string; roster: { active: string[]; out: OutPlayer[] }; label: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
      <div className="px-4 py-3 bg-muted/30 border-b border-border/30">
        <span className="font-bold">{teamName}</span>
        <span className="ml-2 text-xs text-muted-foreground">{label}</span>
      </div>

      {/* Active Players */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex size-2 rounded-full bg-green-400" />
          <span className="text-xs font-medium text-green-400">ACTIVE ({roster.active.length})</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {roster.active.map((name, i) => (
            <span key={i} className="rounded-lg bg-muted/30 border border-border/30 px-3 py-1.5 text-xs font-medium">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Out Players */}
      {roster.out.length > 0 && (
        <div className="p-4 pt-0 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="size-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">OUT / INACTIVE ({roster.out.length})</span>
          </div>
          {roster.out.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/20 px-3 py-2">
              <span className="text-sm font-medium">{p.name}</span>
              <span className="text-xs text-red-400">{p.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
