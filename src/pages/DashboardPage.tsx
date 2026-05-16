import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Clock,
  Crown,
  DollarSign,
  Flame,
  Radio,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DataModeIndicator } from "@/components/propedge/DataModeIndicator";
import {
  FadeIn,
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/propedge/PageTransition";
import { PremiumEmptyState } from "@/components/propedge/PremiumEmptyState";
import { SportsHeroBackground } from "@/components/propedge/SportsHeroBackground";
import { Badge } from "@/components/ui/badge";
import {
  getPlayerInitials,
  getSportIcon,
  getTeamAbbr,
  getTeamColors,
} from "@/lib/assets";
import { formatDirection, formatLabel } from "@/lib/labels";
import { api } from "../../convex/_generated/api";

const sportFilters = ["All", "NBA", "NFL", "MLB", "NHL"];
const CHART_COLORS = ["#00FF88", "#00D4FF", "#A855F7", "#FF4466", "#FFB800"];

export function DashboardPage() {
  const [activeSport, setActiveSport] = useState("All");
  const topEdges = useQuery(api.props.getTopEdges, { limit: 20 });
  const topValue = useQuery(api.props.getTopValuePicks, { limit: 7 });
  const stats = useQuery(api.props.stats, {});
  const games = useQuery(api.games.listUpcoming, {});
  const allProps = useQuery(api.props.list, {});

  const loading = allProps === undefined;
  const hasData = (allProps?.length ?? 0) > 0;
  const liveGames = games?.filter((g: any) => g.status === "live") || [];
  const upcomingGames =
    games?.filter((g: any) => g.status === "upcoming") || [];

  const filteredEdges = topEdges?.filter(
    (p: any) => activeSport === "All" || p.sport === activeSport,
  );

  const kalshiProps =
    allProps?.filter((p: any) => p.platform === "Kalshi" || p.isKalshiMarket) ||
    [];

  // Determine data mode
  // Will become "live"/"hybrid" when real data is connected
  const dataMode: "demo" | "live" | "hybrid" = "demo";

  // Edge distribution chart
  const edgeDistribution = allProps
    ? (() => {
        const buckets: Record<string, number> = {
          "< -10%": 0,
          "-10 to -5%": 0,
          "-5 to 0%": 0,
          "0 to 5%": 0,
          "5 to 10%": 0,
          "> 10%": 0,
        };
        for (const p of allProps) {
          if (!isFinite(p.edge)) continue;
          if (p.edge < -10) buckets["< -10%"]++;
          else if (p.edge < -5) buckets["-10 to -5%"]++;
          else if (p.edge < 0) buckets["-5 to 0%"]++;
          else if (p.edge < 5) buckets["0 to 5%"]++;
          else if (p.edge < 10) buckets["5 to 10%"]++;
          else buckets["> 10%"]++;
        }
        return Object.entries(buckets).map(([name, count]) => ({
          name,
          count,
        }));
      })()
    : [];

  // Sport breakdown
  const sportBreakdown = allProps
    ? (() => {
        const counts: Record<string, number> = {};
        for (const p of allProps) {
          counts[p.sport] = (counts[p.sport] || 0) + 1;
        }
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
      })()
    : [];

  // Hot props
  const hotProps =
    allProps
      ?.filter((p: any) => p.hotColdStreak?.type === "hot" && p.edge > 5)
      .sort((a: any, b: any) => b.edge - a.edge)
      .slice(0, 5) || [];

  // Top movers (props with highest edge magnitude)
  const topMovers = allProps
    ? [...allProps]
        .filter(p => Math.abs(p.edge) > 8)
        .sort((a, b) => Math.abs(b.edge) - Math.abs(a.edge))
        .slice(0, 4)
    : [];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-[1400px]">
        {/* ===== HERO BACKGROUND ===== */}
        <SportsHeroBackground
          sport={stats?.topSport || ""}
          intensity="low"
          className="rounded-2xl -mx-2 px-2 py-6 -mt-2"
        >
          {/* ===== HEADER ===== */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <FadeIn>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#FF6B35] flex items-center justify-center shadow-lg shadow-[#FFB800]/20">
                    <Flame className="size-5 text-white" />
                  </div>
                  Edge Dashboard
                </h1>
                <p className="text-sm text-muted-foreground/70 mt-1.5 ml-[52px]">
                  Real-time edge detection across all platforms
                </p>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="flex items-center gap-3">
                <DataModeIndicator
                  mode={dataMode}
                  totalProps={allProps?.length}
                  liveEvents={liveGames.length}
                />
                {liveGames.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FF4466]/10 border border-[#FF4466]/20">
                    <Radio className="size-3 text-[#FF4466] animate-pulse" />
                    <span className="text-xs font-bold text-[#FF4466]">
                      {liveGames.length} LIVE
                    </span>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </SportsHeroBackground>

        {/* ===== EMPTY STATE (when no data) ===== */}
        {!loading && !hasData && (
          <PremiumEmptyState
            type="no-sync"
            title="Live Data Not Synced Yet"
            description="Connect your The Odds API key in the Convex dashboard and run a full sync. Demo data will appear once the database is seeded."
            actionLabel="View Data Sources"
            onAction={() => (window.location.href = "/data-sources")}
            providerStatus={[
              { name: "The Odds API", status: "pending" },
              { name: "SportsData.io", status: "pending" },
            ]}
          />
        )}

        {/* ===== TODAY'S EDGE BOARD HERO ===== */}
        {topValue && topValue.length > 0 && (
          <FadeIn delay={0.05}>
            <div className="bg-gradient-to-br from-[#A855F7]/10 via-[#0A0E17] to-[#00FF88]/10 rounded-2xl border border-[#A855F7]/20 p-5 md:p-6 relative overflow-hidden">
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#A855F7]/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FF88]/5 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#00FF88] flex items-center justify-center shadow-lg shadow-[#A855F7]/20">
                      <Crown className="size-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Today's Edge Board
                      </h2>
                      <p className="text-xs text-muted-foreground/60">
                        Top value picks across all platforms
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DataModeIndicator
                      mode={dataMode}
                      className="hidden sm:flex"
                    />
                    <Link
                      to="/props"
                      className="text-xs text-[#A855F7] hover:text-[#A855F7]/80 flex items-center gap-1 font-medium transition-colors"
                    >
                      View All <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>

                <StaggerContainer
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
                  stagger={0.04}
                >
                  {topValue.slice(0, 7).map((p: any, i: number) => {
                    const colors = getTeamColors(p.team);
                    return (
                      <StaggerItem key={p._id}>
                        <Link
                          to="/props"
                          className={`group relative bg-[#111827]/80 backdrop-blur-sm rounded-xl border p-4 hover:scale-[1.02] transition-all duration-200 ${
                            i === 0
                              ? "border-[#FFB800]/30 shadow-lg shadow-[#FFB800]/5"
                              : "border-[#1E293B]/80 hover:border-[#A855F7]/30"
                          }`}
                        >
                          {i === 0 && (
                            <div className="absolute -top-2 -right-2 z-10">
                              <span className="text-[10px] font-bold bg-gradient-to-r from-[#FFB800] to-[#FF6B35] text-[#0A0E17] px-2 py-0.5 rounded-lg shadow-lg shadow-[#FFB800]/20">
                                👑 #1
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2.5 mb-2.5">
                            {/* Player mini avatar */}
                            <div
                              className="size-8 rounded-lg border flex items-center justify-center text-[10px] font-extrabold shrink-0"
                              style={{
                                borderColor: `${colors.primary}30`,
                                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}08)`,
                                color: `${colors.primary}90`,
                              }}
                            >
                              {getPlayerInitials(p.playerName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white truncate">
                                  {p.playerName}
                                </span>
                                {p.hotColdStreak?.type === "hot" && (
                                  <span className="text-[9px]">🔥</span>
                                )}
                              </div>
                              <div className="text-[10px] text-muted-foreground/50 truncate">
                                {getTeamAbbr(p.team)} ·{" "}
                                {formatLabel(p.statType)} · {p.sport}
                              </div>
                            </div>
                            <ValueScoreBadge score={p.valueScore} />
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge
                              className={`text-[10px] font-bold ${
                                p.overUnder === "over"
                                  ? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
                                  : "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
                              }`}
                            >
                              {formatDirection(p.overUnder)} {p.line}
                            </Badge>
                            <span
                              className={`text-xs font-mono font-bold ${p.edge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}
                            >
                              {p.edge > 0 ? "+" : ""}
                              {p.edge}%
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2.5 text-[9px] text-muted-foreground/50">
                            <span>Conf: {p.confidence}%</span>
                            <span>·</span>
                            <span>Bust: {p.bustRisk ?? "?"}%</span>
                            <span>·</span>
                            <span
                              className={`${p.platform === "Kalshi" ? "text-[#A855F7]" : ""}`}
                            >
                              {formatLabel(p.platform)}
                            </span>
                          </div>

                          {/* Hover glow */}
                          <div
                            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                              boxShadow: `inset 0 0 30px ${colors.primary}08`,
                            }}
                          />
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>
            </div>
          </FadeIn>
        )}

        {/* ===== LIVE GAMES TICKER ===== */}
        {liveGames.length > 0 && (
          <FadeIn delay={0.1}>
            <div className="bg-gradient-to-r from-[#FF4466]/5 via-[#111827] to-[#FF4466]/5 rounded-2xl border border-[#FF4466]/15 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-7 rounded-lg bg-[#FF4466]/10 flex items-center justify-center">
                  <Radio className="size-3.5 text-[#FF4466] animate-pulse" />
                </div>
                <span className="text-sm font-bold text-white">Live Games</span>
                <Badge className="text-[10px] bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20 animate-pulse">
                  LIVE
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {liveGames.map((game: any) => {
                  const liveProps =
                    allProps?.filter(
                      (p: any) => p.gameId === game._id && p.edge > 5,
                    ) || [];
                  return (
                    <Link
                      to={`/game/${game._id}`}
                      key={game._id}
                      className="bg-[#0A0E17] border border-[#FF4466]/10 rounded-xl p-3.5 hover:border-[#FF4466]/30 hover:bg-[#0A0E17]/80 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <Badge className="text-[10px] bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20">
                          {game.quarter} {game.gameClock}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground/50">
                            {game.broadcast}
                          </span>
                          <ChevronRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]">
                              {getSportIcon(game.sport || "NBA")}
                            </span>
                            <span className="text-sm text-[#C8D0E0]">
                              {game.awayTeam}
                            </span>
                          </div>
                          <span className="text-lg font-bold font-mono text-white">
                            {game.awayScore}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] opacity-0">🏀</span>
                            <span className="text-sm text-[#C8D0E0]">
                              {game.homeTeam}
                            </span>
                          </div>
                          <span className="text-lg font-bold font-mono text-white">
                            {game.homeScore}
                          </span>
                        </div>
                      </div>
                      {liveProps.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#1E293B]">
                          <div className="text-[10px] text-[#00FF88] font-semibold mb-1">
                            ⚡ {liveProps.length} live edges
                          </div>
                          {liveProps.slice(0, 2).map((p: any) => (
                            <div
                              key={p._id}
                              className="text-[10px] text-muted-foreground/60"
                            >
                              {p.playerName} {formatDirection(p.overUnder)}{" "}
                              {p.line} {formatLabel(p.statType)}{" "}
                              <span className="text-[#00FF88]">+{p.edge}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ===== STATS CARDS ===== */}
        {hasData && (
          <StaggerContainer
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            stagger={0.05}
          >
            <StaggerItem>
              <StatCard
                title="Total Props"
                value={stats?.totalProps?.toString() || "—"}
                icon={<BarChart3 className="size-4" />}
                color="#00D4FF"
                subtitle="Across all sports"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Avg Edge"
                value={stats ? `${stats.avgEdge}%` : "—"}
                icon={<TrendingUp className="size-4" />}
                color="#00FF88"
                subtitle="Mean absolute edge"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="+EV Props"
                value={stats?.positiveEdgeCount?.toString() || "—"}
                icon={<Target className="size-4" />}
                color="#A855F7"
                subtitle="Positive edge plays"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Top Sport"
                value={
                  stats?.topSport && stats.totalProps > 0 ? stats.topSport : "—"
                }
                icon={<Zap className="size-4" />}
                color="#FFB800"
                subtitle={
                  stats?.totalProps && stats.totalProps > 0
                    ? "Most props today"
                    : "No data yet"
                }
              />
            </StaggerItem>
          </StaggerContainer>
        )}

        {/* ===== TOP MOVERS ===== */}
        {topMovers.length > 0 && (
          <FadeIn delay={0.15}>
            <div className="bg-gradient-to-r from-[#00FF88]/5 via-transparent to-[#FF4466]/5 rounded-2xl border border-white/[0.06] p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-7 rounded-lg bg-[#00FF88]/10 flex items-center justify-center">
                  <TrendingUp className="size-3.5 text-[#00FF88]" />
                </div>
                <span className="text-sm font-bold text-white">
                  Sharp Line Movement
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  Biggest edge shifts
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {topMovers.map((p: any) => {
                  const colors = getTeamColors(p.team);
                  return (
                    <motion.div
                      key={p._id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-[#0A0E17] border border-white/[0.06] rounded-xl p-3.5"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="size-6 rounded-md flex items-center justify-center text-[8px] font-bold"
                          style={{
                            background: `${colors.primary}15`,
                            color: `${colors.primary}80`,
                          }}
                        >
                          {getPlayerInitials(p.playerName)}
                        </div>
                        <span className="text-xs font-bold text-white truncate">
                          {p.playerName}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/50 mb-1.5">
                        {formatLabel(p.statType)} ·{" "}
                        {formatDirection(p.overUnder)} {p.line}
                      </div>
                      <div
                        className={`text-sm font-mono font-bold ${p.edge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}
                      >
                        {p.edge > 0 ? "+" : ""}
                        {p.edge}% edge
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ===== HOT PROPS ===== */}
        {hotProps.length > 0 && (
          <FadeIn delay={0.2}>
            <div className="bg-gradient-to-r from-[#FF6B35]/5 to-transparent rounded-2xl border border-[#FF6B35]/15 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="size-7 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                  <Sparkles className="size-3.5 text-[#FF6B35]" />
                </div>
                <span className="text-sm font-bold text-white">
                  🔥 Hot Streak Props
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  Players on fire with positive edges
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {hotProps.map((p: any) => {
                  const colors = getTeamColors(p.team);
                  return (
                    <Link
                      key={p._id}
                      to="/props"
                      className="bg-[#0A0E17] border border-[#FF6B35]/10 rounded-xl p-3.5 hover:border-[#FF6B35]/25 transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="size-6 rounded-md flex items-center justify-center text-[8px] font-bold"
                          style={{
                            background: `${colors.primary}15`,
                            color: `${colors.primary}80`,
                          }}
                        >
                          {getPlayerInitials(p.playerName)}
                        </div>
                        <span className="text-xs font-bold text-white truncate">
                          {p.playerName}
                        </span>
                        <span className="text-[10px] bg-[#FF6B35]/15 text-[#FF6B35] px-1.5 rounded-md">
                          {p.hotColdStreak?.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground/50">
                        {formatLabel(p.statType)} ·{" "}
                        {formatDirection(p.overUnder)} {p.line}
                      </div>
                      <div className="text-sm font-mono font-bold text-[#00FF88] mt-1.5">
                        +{p.edge}% edge
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ===== SPORT FILTER ===== */}
        {hasData && (
          <div className="flex items-center gap-1.5 p-1 bg-[#111827]/80 rounded-xl border border-[#1E293B] w-fit">
            {sportFilters.map(sport => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSport === sport
                    ? "bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/20 shadow-sm shadow-[#A855F7]/10"
                    : "text-[#7B8BA8] hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                {sport !== "All" && (
                  <span className="mr-1">{getSportIcon(sport)}</span>
                )}
                {sport}
              </button>
            ))}
          </div>
        )}

        {/* ===== MAIN GRID ===== */}
        {hasData && (
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Main Table */}
            <div className="lg:col-span-2 space-y-5">
              <FadeIn delay={0.1}>
                <div className="bg-[#111827]/80 rounded-2xl border border-[#1E293B]/80 overflow-hidden backdrop-blur-sm">
                  <div className="p-4 md:p-5 border-b border-[#1E293B] flex items-center justify-between">
                    <h2 className="font-semibold text-white flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-[#00FF88]/10 flex items-center justify-center">
                        <TrendingUp className="size-3.5 text-[#00FF88]" />
                      </div>
                      Highest Edge Props
                    </h2>
                    <Link
                      to="/props"
                      className="text-xs text-[#A855F7] hover:text-[#A855F7]/80 flex items-center gap-1 font-medium transition-colors"
                    >
                      View All <ChevronRight className="size-3" />
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1E293B]/80 text-[#7B8BA8]">
                          <th className="text-left p-3 md:p-4 font-medium text-xs">
                            Player
                          </th>
                          <th className="text-left p-3 font-medium text-xs">
                            Prop
                          </th>
                          <th className="text-right p-3 font-medium text-xs">
                            Line
                          </th>
                          <th className="text-right p-3 font-medium text-xs">
                            Proj
                          </th>
                          <th className="text-right p-3 font-medium text-xs">
                            Edge
                          </th>
                          <th className="text-center p-3 font-medium text-xs">
                            Value
                          </th>
                          <th className="text-center p-3 font-medium text-xs">
                            Streak
                          </th>
                          <th className="text-center p-3 font-medium text-xs">
                            Pick
                          </th>
                          <th className="text-left p-3 font-medium text-xs">
                            Platform
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEdges?.slice(0, 12).map((prop: any) => {
                          const colors = getTeamColors(prop.team);
                          return (
                            <tr
                              key={prop._id}
                              className="border-b border-[#1E293B]/30 hover:bg-[#1A2236]/50 transition-colors"
                            >
                              <td className="p-3 md:p-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className="size-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0"
                                    style={{
                                      background: `${colors.primary}12`,
                                      color: `${colors.primary}80`,
                                    }}
                                  >
                                    {getPlayerInitials(prop.playerName)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white text-sm">
                                      {prop.playerName}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground/50">
                                      {getTeamAbbr(prop.team)} · {prop.sport}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-[#C8D0E0] text-xs">
                                {formatLabel(prop.statType)}
                              </td>
                              <td className="p-3 text-right font-mono text-[#C8D0E0]">
                                {prop.line}
                              </td>
                              <td className="p-3 text-right font-mono font-medium text-white">
                                {prop.projection}
                              </td>
                              <td className="p-3 text-right">
                                <span
                                  className={`font-mono font-bold text-xs ${prop.edge > 0 ? "text-[#00FF88]" : prop.edge < -3 ? "text-[#FF4466]" : "text-[#FFB800]"}`}
                                >
                                  {prop.edge > 0 ? "+" : ""}
                                  {prop.edge}%
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <ValueScoreBadge score={prop.valueScore} />
                              </td>
                              <td className="p-3 text-center">
                                {prop.hotColdStreak?.type === "hot" ? (
                                  <span className="text-[10px] font-bold text-[#FF6B35] bg-[#FF6B35]/10 px-1.5 py-0.5 rounded-md">
                                    {prop.hotColdStreak.label}
                                  </span>
                                ) : prop.hotColdStreak?.type === "cold" ? (
                                  <span className="text-[10px] font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded-md">
                                    {prop.hotColdStreak.label}
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground/30">
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <Badge
                                  className={`text-[10px] font-bold ${
                                    prop.overUnder === "over"
                                      ? "bg-[#00FF88]/12 text-[#00FF88] border-[#00FF88]/20"
                                      : "bg-[#FF4466]/12 text-[#FF4466] border-[#FF4466]/20"
                                  }`}
                                >
                                  {formatDirection(prop.overUnder)}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <span className="text-[10px] text-muted-foreground/60 bg-[#1A2236] px-2 py-0.5 rounded-md">
                                  {formatLabel(prop.platform)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </FadeIn>

              {/* Kalshi Markets */}
              {kalshiProps.length > 0 && (
                <FadeIn delay={0.15}>
                  <div className="bg-[#111827]/80 rounded-2xl border border-[#A855F7]/15 overflow-hidden backdrop-blur-sm">
                    <div className="p-4 md:p-5 border-b border-[#1E293B] flex items-center justify-between">
                      <h2 className="font-semibold text-white flex items-center gap-2">
                        <div className="size-7 rounded-lg bg-[#A855F7]/10 flex items-center justify-center">
                          <DollarSign className="size-3.5 text-[#A855F7]" />
                        </div>
                        Kalshi Markets
                      </h2>
                      <Badge className="text-[10px] bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/20">
                        {kalshiProps.length} Active
                      </Badge>
                    </div>
                    <div className="divide-y divide-[#1E293B]/30">
                      {kalshiProps.slice(0, 6).map((prop: any) => (
                        <div
                          key={prop._id}
                          className="flex items-center gap-4 p-3.5 hover:bg-[#1A2236]/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm">
                              {prop.playerName} — {formatLabel(prop.statType)}
                            </div>
                            <div className="text-[10px] text-muted-foreground/50 mt-0.5">
                              {prop.sport} · Line: {prop.line}
                            </div>
                          </div>
                          <div className="text-center shrink-0">
                            <div className="text-sm font-mono font-bold text-[#A855F7]">
                              {prop.impliedProb || "—"}%
                            </div>
                            <div className="text-[9px] text-muted-foreground/40">
                              Implied
                            </div>
                          </div>
                          <div className="text-center shrink-0">
                            <div className="text-sm font-mono text-[#00FF88]">
                              {prop.kalshiPayout?.yesPayout?.toFixed(2) || "—"}x
                            </div>
                            <div className="text-[9px] text-muted-foreground/40">
                              YES Pay
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`text-sm font-mono font-bold ${prop.edge > 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}
                            >
                              {prop.edge > 0 ? "+" : ""}
                              {prop.edge}%
                            </span>
                          </div>
                          <Badge
                            className={`text-[10px] font-bold shrink-0 ${
                              prop.edge > 0
                                ? "bg-[#00FF88]/12 text-[#00FF88] border-[#00FF88]/20"
                                : "bg-[#FF4466]/12 text-[#FF4466] border-[#FF4466]/20"
                            }`}
                          >
                            {prop.edge > 0 ? "YES" : "NO"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-5">
              {/* Provider Sync Status */}
              <FadeIn delay={0.1}>
                <div className="bg-[#111827]/80 rounded-2xl border border-[#1E293B]/80 p-4 md:p-5 backdrop-blur-sm">
                  <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <RefreshCw className="size-3 text-emerald-400" />
                    </div>
                    Data Status
                  </h3>
                  <div className="space-y-2.5">
                    <ProviderStatusRow name="The Odds API" status="demo" />
                    <ProviderStatusRow name="SportsData.io" status="pending" />
                    <ProviderStatusRow
                      name="Kalshi"
                      status={kalshiProps.length > 0 ? "demo" : "pending"}
                    />
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1E293B]">
                    <Link
                      to="/data-sources"
                      className="text-[10px] text-[#A855F7] hover:text-[#A855F7]/80 flex items-center gap-1 font-medium transition-colors"
                    >
                      Manage Data Sources <ChevronRight className="size-2.5" />
                    </Link>
                  </div>
                </div>
              </FadeIn>

              {/* Edge Distribution */}
              <FadeIn delay={0.15}>
                <div className="bg-[#111827]/80 rounded-2xl border border-[#1E293B]/80 p-4 md:p-5 backdrop-blur-sm">
                  <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center">
                      <BarChart3 className="size-3 text-[#00D4FF]" />
                    </div>
                    Edge Distribution
                  </h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={edgeDistribution} barSize={18}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#1E293B50"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#7B8BA8", fontSize: 9 }}
                          axisLine={{ stroke: "#1E293B50" }}
                        />
                        <YAxis
                          tick={{ fill: "#7B8BA8", fontSize: 9 }}
                          axisLine={{ stroke: "#1E293B50" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #1E293B",
                            borderRadius: "12px",
                            color: "#E8ECF4",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {edgeDistribution.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </FadeIn>

              {/* Sport Breakdown */}
              <FadeIn delay={0.2}>
                <div className="bg-[#111827]/80 rounded-2xl border border-[#1E293B]/80 p-4 md:p-5 backdrop-blur-sm">
                  <h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-[#A855F7]/10 flex items-center justify-center">
                      <Activity className="size-3 text-[#A855F7]" />
                    </div>
                    Props by Sport
                  </h3>
                  <div className="h-[180px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sportBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {sportBreakdown.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #1E293B",
                            borderRadius: "12px",
                            color: "#E8ECF4",
                            fontSize: "11px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {sportBreakdown.map((s, i) => (
                      <div
                        key={s.name}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <div
                          className="size-2 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-[#7B8BA8]">
                          {getSportIcon(s.name)} {s.name} ({s.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Upcoming Games */}
              <FadeIn delay={0.25}>
                <div className="bg-[#111827]/80 rounded-2xl border border-[#1E293B]/80 p-4 md:p-5 backdrop-blur-sm">
                  <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                    <div className="size-6 rounded-lg bg-[#FFB800]/10 flex items-center justify-center">
                      <Clock className="size-3 text-[#FFB800]" />
                    </div>
                    Upcoming Games
                  </h3>
                  <div className="space-y-2">
                    {(upcomingGames?.length ?? 0) > 0 ? (
                      upcomingGames?.slice(0, 6).map((game: any) => (
                        <Link
                          to={`/game/${game._id}`}
                          key={game._id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0E17] border border-[#1E293B]/40 hover:border-[#1E293B] hover:bg-[#0F1520] transition-all cursor-pointer group"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">
                              {game.awayTeam} @ {game.homeTeam}
                            </div>
                            <div className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                              {new Date(game.gameTime).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                              {game.broadcast && (
                                <span className="text-[#7B8BA8]/50">
                                  · {game.broadcast}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-[#1E293B] text-[#7B8BA8] shrink-0"
                          >
                            {game.sport}
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground/40 text-center py-4">
                        No upcoming games
                      </p>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}

// ─── Sub Components ───

function ValueScoreBadge({ score }: { score?: number }) {
  if (score == null) return null;
  const color =
    score >= 75
      ? "#00FF88"
      : score >= 55
        ? "#FFB800"
        : score >= 35
          ? "#00D4FF"
          : "#FF4466";
  const bg =
    score >= 75
      ? "bg-[#00FF88]/12"
      : score >= 55
        ? "bg-[#FFB800]/12"
        : score >= 35
          ? "bg-[#00D4FF]/12"
          : "bg-[#FF4466]/12";
  return (
    <div
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg ${bg}`}
    >
      <Star className="size-2.5" style={{ color }} />
      <span className="text-[10px] font-bold font-mono" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="bg-[#111827]/80 rounded-2xl border border-[#1E293B]/80 p-4 hover:border-[#A855F7]/15 transition-all duration-200 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] text-[#7B8BA8] font-medium uppercase tracking-wider">
          {title}
        </span>
        <div
          className="size-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}12`, color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-[10px] text-muted-foreground/50 mt-1">
        {subtitle}
      </div>
    </div>
  );
}

function ProviderStatusRow({
  name,
  status,
}: {
  name: string;
  status: "connected" | "demo" | "pending" | "error";
}) {
  const configs = {
    connected: {
      dot: "bg-emerald-400",
      label: "Connected",
      color: "text-emerald-400",
    },
    demo: { dot: "bg-amber-400", label: "Demo Mode", color: "text-amber-400" },
    pending: {
      dot: "bg-white/20",
      label: "Not Connected",
      color: "text-muted-foreground/50",
    },
    error: { dot: "bg-red-400", label: "Error", color: "text-red-400" },
  };
  const c = configs[status];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`size-2 rounded-full ${c.dot}`} />
        <span className="text-xs text-white/70">{name}</span>
      </div>
      <span className={`text-[10px] font-medium ${c.color}`}>{c.label}</span>
    </div>
  );
}
