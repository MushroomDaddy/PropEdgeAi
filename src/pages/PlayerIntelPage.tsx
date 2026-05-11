import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  Search, User, TrendingUp, AlertTriangle, Activity, Target,
  ChevronDown, ChevronUp, Shield,
} from "lucide-react";

export function PlayerIntelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const searchResults = useQuery(api.playerIntel.searchPlayers, { searchTerm: searchTerm.length >= 2 ? searchTerm : "" });
  const profile = useQuery(api.playerIntel.playerProfile, selectedPlayer ? { playerName: selectedPlayer } : "skip");

  return (
    <div className="space-y-6">
      {/* DEMO banner */}
      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-sm text-yellow-400">
        <AlertTriangle className="size-4" />
        <span>DEMO DATA — Player stats are mock data for demonstration. Connect live stat APIs for real game logs.</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00FF88] to-[#00D4FF] bg-clip-text text-transparent">
          Player Intelligence
        </h1>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search any player..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF88]/40"
        />
        {searchResults && searchResults.length > 0 && !selectedPlayer && (
          <div className="absolute top-full mt-1 left-0 right-0 rounded-lg border border-white/10 bg-card shadow-xl z-50 max-h-60 overflow-auto">
            {searchResults.map((p: any) => (
              <button
                key={p._id}
                onClick={() => { setSelectedPlayer(p.name); setSearchTerm(p.name); }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0"
              >
                <User className="size-4 text-[#00FF88]" />
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.team} · {p.position} · {p.sport}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Player Profile */}
      {profile ? (
        <PlayerProfileView profile={profile} />
      ) : selectedPlayer ? (
        <div className="text-center py-12 text-muted-foreground">Loading player data...</div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <User className="size-12 mx-auto mb-3 opacity-30" />
          <p>Search for a player to view their full intelligence profile</p>
          <p className="text-xs mt-1">Game logs, splits, prop hit rates, matchups, trends & more</p>
        </div>
      )}
    </div>
  );
}

function PlayerProfileView({ profile }: { profile: any }) {
  const [showAllLogs, setShowAllLogs] = useState(false);
  const p = profile.player;

  return (
    <div className="space-y-4">
      {/* Player Header */}
      <div className="rounded-lg border border-white/10 bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-xl bg-gradient-to-br from-[#00FF88]/20 to-[#00D4FF]/20 border border-[#00FF88]/30 flex items-center justify-center">
            <User className="size-8 text-[#00FF88]" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{p.name}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>{p.team}</span>
              <span>·</span>
              <span>{p.position}</span>
              <span>·</span>
              <span>{p.sport}</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                p.injuryStatus === "Active" ? "bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20"
                : p.injuryStatus === "GTD" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {p.injuryStatus}
              </span>
              <span className="text-xs text-muted-foreground">Form: {p.recentForm}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Averages Row */}
      <div className="grid grid-cols-3 gap-3">
        <AvgCard title="Last 5 Avg" data={profile.last5Avg} />
        <AvgCard title="Last 10 Avg" data={profile.last10Avg} />
        <AvgCard title="Season Avg" data={profile.seasonAvg} />
      </div>

      {/* Home/Away Splits */}
      <div className="rounded-lg border border-white/10 bg-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="size-4 text-[#00D4FF]" /> Home / Away Splits
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-[#00FF88]/5 border border-[#00FF88]/20">
            <div className="text-xs text-muted-foreground mb-1">HOME</div>
            <div className="text-sm">
              {profile.homeAwaySplits.home.points !== undefined && <span className="mr-3">{profile.homeAwaySplits.home.points} PTS</span>}
              {profile.homeAwaySplits.home.rebounds !== undefined && <span className="mr-3">{profile.homeAwaySplits.home.rebounds} REB</span>}
              {profile.homeAwaySplits.home.assists !== undefined && <span>{profile.homeAwaySplits.home.assists} AST</span>}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="text-xs text-muted-foreground mb-1">AWAY</div>
            <div className="text-sm">
              {profile.homeAwaySplits.away.points !== undefined && <span className="mr-3">{profile.homeAwaySplits.away.points} PTS</span>}
              {profile.homeAwaySplits.away.rebounds !== undefined && <span className="mr-3">{profile.homeAwaySplits.away.rebounds} REB</span>}
              {profile.homeAwaySplits.away.assists !== undefined && <span>{profile.homeAwaySplits.away.assists} AST</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Prop Hit Rates vs Current Lines */}
        {profile.propHitRates.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="size-4 text-[#00FF88]" /> Hit Rate vs Current Lines
            </h3>
            <div className="space-y-2">
              {profile.propHitRates.map((pr: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 text-sm">
                  <span className="text-muted-foreground">{pr.statType} {pr.overUnder} {pr.line}</span>
                  <span className={`font-mono font-medium ${pr.hitRate >= 55 ? "text-[#00FF88]" : pr.hitRate >= 45 ? "text-yellow-400" : "text-red-400"}`}>
                    {pr.hitRate}% <span className="text-xs text-muted-foreground">(n={pr.sampleSize})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opponent Matchups */}
        {profile.matchups.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Shield className="size-4 text-purple-400" /> Opponent Matchup History
            </h3>
            <div className="space-y-1.5">
              {profile.matchups.map((m: any) => (
                <div key={m.opponent} className="flex items-center justify-between py-1 text-sm">
                  <span>vs {m.opponent} <span className="text-xs text-muted-foreground">({m.games}G)</span></span>
                  <span className="font-mono">{m.avgPoints} PPG</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Props */}
        {profile.currentProps.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-[#00D4FF]" /> Current Props
            </h3>
            <div className="space-y-2">
              {profile.currentProps.map((cp: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 text-sm">
                  <div>
                    <span className="font-medium">{cp.statType}</span>
                    <span className="text-xs text-muted-foreground ml-2">{cp.platform}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span>Line: {cp.line}</span>
                    <span>Proj: {cp.projection}</span>
                    <span className={cp.edge > 0 ? "text-[#00FF88]" : "text-red-400"}>
                      Edge: {cp.edge > 0 ? "+" : ""}{cp.edge.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minutes/Usage Trend */}
        {profile.minutesTrend.length > 0 && (
          <div className="rounded-lg border border-white/10 bg-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="size-4 text-yellow-400" /> Minutes / Usage Trend
            </h3>
            <div className="space-y-1">
              {profile.minutesTrend.map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-16">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  <span className="w-16 text-muted-foreground">vs {t.opponent}</span>
                  <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden">
                    <div className="h-full bg-[#00D4FF]/40 rounded" style={{ width: `${(t.minutes / 48) * 100}%` }} />
                  </div>
                  <span className="font-mono w-8">{t.minutes}m</span>
                  <span className="font-mono w-10 text-[#00FF88]">{t.points}pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game Log Table */}
      <div className="rounded-lg border border-white/10 bg-card overflow-x-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-sm font-semibold">Recent Game Log</h3>
          <button
            onClick={() => setShowAllLogs(!showAllLogs)}
            className="text-xs text-[#00FF88] flex items-center gap-1"
          >
            {showAllLogs ? "Show Less" : "Show All"} {showAllLogs ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10 text-left text-muted-foreground uppercase">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Opp</th>
              <th className="px-3 py-2">H/A</th>
              {p.sport === "NBA" && (<>
                <th className="px-3 py-2">MIN</th>
                <th className="px-3 py-2">PTS</th>
                <th className="px-3 py-2">REB</th>
                <th className="px-3 py-2">AST</th>
                <th className="px-3 py-2">STL</th>
                <th className="px-3 py-2">BLK</th>
                <th className="px-3 py-2">TO</th>
                <th className="px-3 py-2">3PM</th>
                <th className="px-3 py-2">FG</th>
              </>)}
              {p.sport === "MLB" && (<>
                <th className="px-3 py-2">H</th>
                <th className="px-3 py-2">RBI</th>
                <th className="px-3 py-2">R</th>
              </>)}
              {p.sport === "NHL" && (<>
                <th className="px-3 py-2">G</th>
                <th className="px-3 py-2">SOG</th>
                <th className="px-3 py-2">SVS</th>
              </>)}
            </tr>
          </thead>
          <tbody>
            {(showAllLogs ? profile.gameLogs : profile.gameLogs.slice(0, 10)).map((log: any, i: number) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-3 py-1.5">{new Date(log.gameDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td className="px-3 py-1.5">{log.opponent}</td>
                <td className="px-3 py-1.5">{log.homeAway === "home" ? "H" : "A"}</td>
                {p.sport === "NBA" && (<>
                  <td className="px-3 py-1.5 font-mono">{log.minutes ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono font-medium">{log.points ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.rebounds ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.assists ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.steals ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.blocks ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.turnovers ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.threePointers ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono text-muted-foreground">{log.fg ?? "—"}</td>
                </>)}
                {p.sport === "MLB" && (<>
                  <td className="px-3 py-1.5 font-mono">{log.hits ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.rbi ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.runs ?? "—"}</td>
                </>)}
                {p.sport === "NHL" && (<>
                  <td className="px-3 py-1.5 font-mono">{log.goals ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.shotsOnGoal ?? "—"}</td>
                  <td className="px-3 py-1.5 font-mono">{log.saves ?? "—"}</td>
                </>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Results History */}
      {profile.resultHistory.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Pick Results History</h3>
          <div className="space-y-1.5">
            {profile.resultHistory.slice(0, 10).map((r: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    r.resultStatus === "won" ? "bg-[#00FF88]/10 text-[#00FF88]" :
                    r.resultStatus === "lost" ? "bg-red-500/10 text-red-400" :
                    "bg-gray-500/10 text-gray-400"
                  }`}>{r.resultStatus.toUpperCase()}</span>
                  <span className="text-muted-foreground">{r.statType}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span>Line: {r.pickLine}</span>
                  {r.actualStat !== undefined && <span>Actual: {r.actualStat}</span>}
                  <span className={r.pickEdge > 0 ? "text-[#00FF88]" : "text-red-400"}>Edge: {r.pickEdge > 0 ? "+" : ""}{r.pickEdge}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AvgCard({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-card p-4">
      <h4 className="text-xs text-muted-foreground mb-2">{title}</h4>
      <div className="space-y-1 text-sm">
        {data.points !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">PTS</span><span className="font-mono font-medium">{data.points}</span></div>}
        {data.rebounds !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">REB</span><span className="font-mono">{data.rebounds}</span></div>}
        {data.assists !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">AST</span><span className="font-mono">{data.assists}</span></div>}
        {data.minutes !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">MIN</span><span className="font-mono">{data.minutes}</span></div>}
        {data.threePointers !== undefined && <div className="flex justify-between"><span className="text-muted-foreground">3PM</span><span className="font-mono">{data.threePointers}</span></div>}
      </div>
    </div>
  );
}
