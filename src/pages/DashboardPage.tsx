import { useQuery } from "convex/react";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Clock,
  Crown,
  DollarSign,
  Flame,
  Radio,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const sportFilters = ["All", "NBA", "NFL", "MLB", "NHL"];
const CHART_COLORS = ["#00FF88", "#00D4FF", "#A855F7", "#FF4466", "#FFB800"];

export function DashboardPage() {
  const [activeSport, setActiveSport] = useState("All");
  const topEdges = useQuery(api.props.getTopEdges, { limit: 20 });
  const topValue = useQuery(api.props.getTopValuePicks, { limit: 7 });
  const stats = useQuery(api.props.stats, {});
  const games = useQuery(api.games.listUpcoming, {});
  const allProps = useQuery(api.props.list, {});

  const liveGames = games?.filter((g: any) => g.status === "live") || [];
  const upcomingGames = games?.filter((g: any) => g.status === "upcoming") || [];

  const filteredEdges = topEdges?.filter(
    (p: any) => activeSport === "All" || p.sport === activeSport
  );

  const kalshiProps = allProps?.filter((p: any) => p.platform === "Kalshi" || p.isKalshiMarket) || [];

  // Edge distribution chart
  const edgeDistribution = allProps
    ? (() => {
        const buckets: Record<string, number> = { "< -10%": 0, "-10 to -5%": 0, "-5 to 0%": 0, "0 to 5%": 0, "5 to 10%": 0, "> 10%": 0 };
        for (const p of allProps) {
          if (!isFinite(p.edge)) continue;
          if (p.edge < -10) buckets["< -10%"]++;
          else if (p.edge < -5) buckets["-10 to -5%"]++;
          else if (p.edge < 0) buckets["-5 to 0%"]++;
          else if (p.edge < 5) buckets["0 to 5%"]++;
          else if (p.edge < 10) buckets["5 to 10%"]++;
          else buckets["> 10%"]++;
        }
        return Object.entries(buckets).map(([name, count]) => ({ name, count }));
      })()
    : [];

  // Sport breakdown
  const sportBreakdown = allProps
    ? (() => {
        const counts: Record<string, number> = {};
        for (const p of allProps) { counts[p.sport] = (counts[p.sport] || 0) + 1; }
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
      })()
    : [];

  // Hot props
  const hotProps = allProps?.filter((p: any) => p.hotColdStreak?.type === "hot" && p.edge > 5).sort((a: any, b: any) => b.edge - a.edge).slice(0, 5) || [];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ===== TODAY'S BEST BETS HERO (R4 NEW) ===== */}
      {topValue && topValue.length > 0 && (
        <div className="bg-gradient-to-br from-[#A855F7]/10 via-[#0A0E17] to-[#00FF88]/10 rounded-2xl border border-[#A855F7]/30 p-5 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#A855F7]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#00FF88]/5 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#00FF88] flex items-center justify-center">
                  <Crown className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Today's Best Edges</h2>
                  <p className="text-xs text-muted-foreground">Top Value Score picks across all platforms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">DEMO DATA</span>
                <Link to="/props" className="text-xs text-[#A855F7] hover:underline flex items-center gap-1">
                  See All Props <ChevronRight className="size-3" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {topValue.slice(0, 7).map((p: any, i: number) => (
                <Link
                  key={p._id}
                  to="/props"
                  className={`relative bg-[#111827]/80 backdrop-blur-sm rounded-xl border p-3.5 hover:scale-[1.02] transition-all ${
                    i === 0 ? "border-[#FFB800]/40 shadow-lg shadow-[#FFB800]/10" : "border-[#1E293B] hover:border-[#A855F7]/30"
                  }`}
                >
                  {i === 0 && (
                    <div className="absolute -top-1.5 -right-1.5">
                      <span className="text-[10px] font-bold bg-[#FFB800] text-[#0A0E17] px-1.5 py-0.5 rounded-md">👑 #1</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{p.playerName}</span>
                      {p.hotColdStreak?.type === "hot" && <span className="text-[9px]">🔥</span>}
                    </div>
                    <ValueScoreBadge score={p.valueScore} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2">
                    {p.statType} · {p.team} · {p.sport}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={`text-[10px] font-bold ${
                      p.overUnder === "over"
                        ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
                        : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                    }`}>
                      {p.overUnder.toUpperCase()} {p.line}
                    </Badge>
                    <span className={`text-xs font-mono font-bold ${p.edge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}>
                      {p.edge > 0 ? "+" : ""}{p.edge}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[9px] text-muted-foreground">
                    <span>Conf: {p.confidence}%</span>
                    <span>•</span>
                    <span>Bust: {p.bustRisk ?? "?"}%</span>
                    <span>•</span>
                    <span className={`${p.platform === "Kalshi" ? "text-[#A855F7]" : ""}`}>{p.platform}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Flame className="size-6 text-[#FFB800]" />
            Edge Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time edge detection across all platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveGames.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FF4466]/10 border border-[#FF4466]/20 mr-2">
              <Radio className="size-3 text-[#FF4466] animate-pulse" />
              <span className="text-xs font-medium text-[#FF4466]">{liveGames.length} LIVE</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/20">
            <div className="size-1.5 rounded-full bg-[#A855F7] animate-pulse" />
            <span className="text-xs font-medium text-[#A855F7]">TRACKING</span>
          </div>
          <span className="text-xs text-muted-foreground">{allProps?.length || 0} props</span>
        </div>
      </div>

      {/* Live Games Ticker — Enhanced R4 */}
      {liveGames.length > 0 && (
        <div className="bg-gradient-to-r from-[#FF4466]/5 via-[#111827] to-[#FF4466]/5 rounded-xl border border-[#FF4466]/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="size-4 text-[#FF4466] animate-pulse" />
            <span className="text-sm font-semibold text-white">Live Games</span>
            <Badge className="text-[10px] bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20 animate-pulse">LIVE</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveGames.map((game: any) => {
              const liveProps = allProps?.filter((p: any) => p.gameId === game._id && p.edge > 5) || [];
              return (
                <Link to={`/game/${game._id}`} key={game._id} className="bg-[#0A0E17] border border-[#FF4466]/10 rounded-lg p-3 hover:border-[#FF4466]/40 hover:bg-[#0A0E17]/80 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="text-[10px] bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20">
                      {game.quarter} {game.gameClock}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{game.broadcast}</span>
                      <ChevronRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#C8D0E0]">{game.awayTeam}</div>
                    <div className="text-lg font-bold font-mono text-white">{game.awayScore}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#C8D0E0]">{game.homeTeam}</div>
                    <div className="text-lg font-bold font-mono text-white">{game.homeScore}</div>
                  </div>
                  {liveProps.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#1E293B]">
                      <div className="text-[10px] text-[#00FF88] font-semibold mb-1">⚡ {liveProps.length} live edges</div>
                      {liveProps.slice(0, 2).map((p: any) => (
                        <div key={p._id} className="text-[10px] text-muted-foreground">
                          {p.playerName} {p.overUnder.toUpperCase()} {p.line} {p.statType} <span className="text-[#00FF88]">+{p.edge}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Props" value={stats?.totalProps?.toString() || "—"} icon={<BarChart3 className="size-4" />} color="#00D4FF" subtitle="Across all sports" />
        <StatCard title="Avg Edge" value={stats ? `${stats.avgEdge}%` : "—"} icon={<TrendingUp className="size-4" />} color="#00FF88" subtitle="Mean absolute edge" />
        <StatCard title="+EV Props" value={stats?.positiveEdgeCount?.toString() || "—"} icon={<Target className="size-4" />} color="#A855F7" subtitle="Positive edge plays" />
        <StatCard title="Top Sport" value={stats?.topSport || "—"} icon={<Zap className="size-4" />} color="#FFB800" subtitle="Most props today" />
      </div>

      {/* Hot Props */}
      {hotProps.length > 0 && (
        <div className="bg-gradient-to-r from-[#FF6B35]/5 to-transparent rounded-xl border border-[#FF6B35]/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-[#FF6B35]" />
            <span className="text-sm font-semibold text-white">🔥 Hot Streak Props</span>
            <span className="text-[10px] text-muted-foreground">Players on fire with positive edges</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {hotProps.map((p: any) => (
              <Link key={p._id} to="/props" className="bg-[#0A0E17] border border-[#FF6B35]/10 rounded-lg p-3 hover:border-[#FF6B35]/30 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-white">{p.playerName}</span>
                  <span className="text-[10px] bg-[#FF6B35]/15 text-[#FF6B35] px-1 rounded">{p.hotColdStreak?.label}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">{p.statType} · {p.overUnder.toUpperCase()} {p.line}</div>
                <div className="text-sm font-mono font-bold text-[#00FF88] mt-1">+{p.edge}% edge</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sport Filter */}
      <div className="flex items-center gap-1 p-1 bg-[#111827] rounded-lg border border-[#1E293B] w-fit">
        {sportFilters.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeSport === sport
                ? "bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/20"
                : "text-[#7B8BA8] hover:text-white"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main Table */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
            <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="size-4 text-[#00FF88]" /> Highest Edge Props
              </h2>
              <Link to="/props" className="text-xs text-[#A855F7] hover:underline flex items-center gap-1">
                View All <ChevronRight className="size-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E293B] text-[#7B8BA8]">
                    <th className="text-left p-3 font-medium">Player</th>
                    <th className="text-left p-3 font-medium">Prop</th>
                    <th className="text-right p-3 font-medium">Line</th>
                    <th className="text-right p-3 font-medium">Proj</th>
                    <th className="text-right p-3 font-medium">Edge</th>
                    <th className="text-center p-3 font-medium">Value</th>
                    <th className="text-center p-3 font-medium">Streak</th>
                    <th className="text-center p-3 font-medium">Pick</th>
                    <th className="text-left p-3 font-medium">Platform</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEdges?.slice(0, 12).map((prop: any) => (
                    <tr key={prop._id} className="border-b border-[#1E293B]/50 hover:bg-[#1A2236]/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <FormDot form={prop.last10Trend} />
                          <div>
                            <div className="font-medium text-white text-sm">{prop.playerName}</div>
                            <div className="text-xs text-muted-foreground">{prop.team} · {prop.sport}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-[#C8D0E0]">{prop.statType}</td>
                      <td className="p-3 text-right font-mono text-[#C8D0E0]">{prop.line}</td>
                      <td className="p-3 text-right font-mono font-medium text-white">{prop.projection}</td>
                      <td className="p-3 text-right">
                        <span className={`font-mono font-bold ${prop.edge > 0 ? "text-[#00FF88]" : prop.edge < -3 ? "text-[#FF4466]" : "text-[#FFB800]"}`}>
                          {prop.edge > 0 ? "+" : ""}{prop.edge}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <ValueScoreBadge score={prop.valueScore} />
                      </td>
                      <td className="p-3 text-center">
                        {prop.hotColdStreak?.type === "hot" ? (
                          <span className="text-[10px] font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded">{prop.hotColdStreak.label}</span>
                        ) : prop.hotColdStreak?.type === "cold" ? (
                          <span className="text-[10px] font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded">{prop.hotColdStreak.label}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={`text-xs font-bold ${
                          prop.overUnder === "over"
                            ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
                            : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                        }`}>
                          {prop.overUnder.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="text-xs text-muted-foreground bg-[#1A2236] px-2 py-0.5 rounded">{prop.platform}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kalshi Markets */}
          {kalshiProps.length > 0 && (
            <div className="bg-[#111827] rounded-xl border border-[#A855F7]/20 overflow-hidden">
              <div className="p-4 border-b border-[#1E293B] flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <DollarSign className="size-4 text-[#A855F7]" /> Kalshi Markets
                </h2>
                <Badge className="text-[10px] bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/20">{kalshiProps.length} Active</Badge>
              </div>
              <div className="divide-y divide-[#1E293B]/50">
                {kalshiProps.slice(0, 6).map((prop: any) => (
                  <div key={prop._id} className="flex items-center gap-4 p-3 hover:bg-[#1A2236]/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">{prop.playerName} — {prop.statType}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{prop.sport} · Line: {prop.line}</div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="text-sm font-mono font-bold text-[#A855F7]">{prop.impliedProb || "—"}%</div>
                      <div className="text-[10px] text-muted-foreground">Implied</div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="text-sm font-mono text-[#00FF88]">{prop.kalshiPayout?.yesPayout?.toFixed(2) || "—"}x</div>
                      <div className="text-[10px] text-muted-foreground">YES Pay</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-mono font-bold ${prop.edge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}>
                        {prop.edge > 0 ? "+" : ""}{prop.edge}%
                      </span>
                    </div>
                    <Badge className={`text-xs font-bold shrink-0 ${
                      prop.edge > 0 ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20" : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                    }`}>
                      {prop.edge > 0 ? "YES" : "NO"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Edge Distribution */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <BarChart3 className="size-4 text-[#00D4FF]" /> Edge Distribution
            </h3>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={edgeDistribution} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" tick={{ fill: "#7B8BA8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} />
                  <YAxis tick={{ fill: "#7B8BA8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "8px", color: "#E8ECF4", fontSize: "12px" }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {edgeDistribution.map((_, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sport Breakdown */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4">
            <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
              <Activity className="size-4 text-[#A855F7]" /> Props by Sport
            </h3>
            <div className="h-[180px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sportBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {sportBreakdown.map((_, index) => (<Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #1E293B", borderRadius: "8px", color: "#E8ECF4", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {sportBreakdown.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-[#7B8BA8]">{s.name} ({s.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Games */}
          <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
              <Clock className="size-4 text-[#FFB800]" /> Upcoming Games
            </h3>
            <div className="space-y-2">
              {upcomingGames?.slice(0, 6).map((game: any) => (
                <Link to={`/game/${game._id}`} key={game._id} className="flex items-center justify-between p-2 rounded-lg bg-[#0A0E17] border border-[#1E293B]/50 hover:border-[#1E293B] hover:bg-[#0F1520] transition-all cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{game.awayTeam} @ {game.homeTeam}</div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {new Date(game.gameTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      {game.broadcast && <span className="text-[#7B8BA8]">· {game.broadcast}</span>}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-[#1E293B] text-[#7B8BA8] shrink-0">{game.sport}</Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// R4: Value Score Badge
function ValueScoreBadge({ score }: { score?: number }) {
  if (score == null) return null;
  const color = score >= 75 ? "#00FF88" : score >= 55 ? "#FFB800" : score >= 35 ? "#00D4FF" : "#FF4466";
  const bg = score >= 75 ? "bg-[#00FF88]/15" : score >= 55 ? "bg-[#FFB800]/15" : score >= 35 ? "bg-[#00D4FF]/15" : "bg-[#FF4466]/15";
  return (
    <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${bg}`}>
      <Star className="size-2.5" style={{ color }} />
      <span className="text-[10px] font-bold font-mono" style={{ color }}>{score}</span>
    </div>
  );
}

function StatCard({ title, value, icon, color, subtitle }: { title: string; value: string; icon: React.ReactNode; color: string; subtitle: string }) {
  return (
    <div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4 hover:border-[#A855F7]/20 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#7B8BA8] font-medium">{title}</span>
        <div className="size-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
    </div>
  );
}

function FormDot({ form }: { form?: string }) {
  const color = form === "up" ? "bg-[#00FF88]" : form === "down" ? "bg-[#FF4466]" : "bg-[#FFB800]";
  return <div className={`size-1.5 rounded-full ${color} shrink-0`} />;
}
