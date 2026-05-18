
import { useTopEdges, useTopValue, usePropsStats, useProps } from '../hooks/api/useProps';
import { useUpcomingGames } from '../hooks/api/useGames';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
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
  Shield,
  Brain,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { DataModeIndicator } from "@/components/propedge/DataModeIndicator";
import {
  FadeIn,
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/propedge/PageTransition";
import { PremiumEmptyState } from "@/components/propedge/PremiumEmptyState";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { PremiumPropCard } from "@/components/dashboard/PremiumPropCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPlayerInitials,
  getSportIcon,
  getTeamAbbr,
  getTeamColors,
} from "@/lib/assets";
import { formatDirection, formatLabel } from "@/lib/labels";
import { cn } from '@/lib/utils';

const SPORTS = ["All", "NBA", "NFL", "MLB", "NHL", "NCAAB", "NCAAF", "Soccer"];

export function DashboardPage() {
  const [activeSport, setActiveSport] = useState("All");
  const stats = usePropsStats().data;
  const games = useUpcomingGames().data;
  const allProps = useProps().data;
  const topValue = useTopValue(12).data;

  const loading = !allProps;
  const hasData = (allProps?.length ?? 0) > 0;
  const liveGames = games?.filter((g: any) => g.status === "live") || [];
  const dataMode: "demo" | "live" | "hybrid" = "demo";

  // Filter by sport
  const filteredProps = topValue?.filter((p: any) =>
    activeSport === "All" ? true : p.sport?.toUpperCase() === activeSport.toUpperCase()
  );

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-20">
        <AnimatedSportsBackground />
        
        <div className="container relative z-10 space-y-8 pt-6">
          {/* Header Command Strip */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/[0.03] border border-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-400 flex items-center justify-center shadow-[0_0_30px_rgba(94,106,210,0.3)]">
                  <Activity className="size-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-4 border-[#08090a] animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  Command Center
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-mono text-[10px] tracking-widest px-2 py-0">LIVE</Badge>
                </h1>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Edge Intelligence Engine • v2.4.0
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sync Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-sm font-bold text-white">4 APIs Active</span>
                </div>
              </div>
              <DataModeIndicator mode={dataMode} />
              <Button 
                size="sm" 
                onClick={async () => {
                    toast.info('Initializing System-Wide Sync...');
                    try {
                        const result = await api.post<any>('/api/sync/trigger', {});
                        toast.success(`SYNC COMPLETE: ${result.message}`);
                        window.location.reload();
                    } catch (e: any) {
                        toast.error('Sync Engine: ' + e.message);
                    }
                }}
                className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest px-4 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              >
                <Zap className="size-4 mr-2" />
                Trigger Global Sync
              </Button>
            </div>
          </div>

          {/* ═══ Pill-Style Sport Selector (Rithmm-style) ═══ */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SPORTS.map((sport) => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={cn(
                  "relative px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border",
                  activeSport === sport
                    ? "bg-primary/10 text-primary border-primary/30 shadow-[0_0_20px_rgba(94,106,210,0.15)]"
                    : "bg-white/[0.02] text-muted-foreground/50 border-white/5 hover:bg-white/[0.05] hover:text-white/80"
                )}
              >
                {activeSport === sport && (
                  <motion.div
                    layoutId="sport-pill-active"
                    className="absolute inset-0 rounded-full bg-primary/10 border border-primary/30"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{sport}</span>
              </button>
            ))}
          </div>

          {/* Core Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FadeIn delay={0.1}>
              <StatCard 
                title="Active Market Props" 
                value={stats?.totalProps?.toLocaleString() || "—"} 
                icon={<Target className="size-5" />} 
                color="indigo"
                sub="12 Sports Tracked"
              />
            </FadeIn>
            <FadeIn delay={0.2}>
              <StatCard 
                title="Edge Alpha" 
                value={stats ? `+${stats.avgEdge}%` : "—"} 
                icon={<TrendingUp className="size-5" />} 
                color="emerald"
                sub="High Conv Play Average"
              />
            </FadeIn>
            <FadeIn delay={0.3}>
              <StatCard 
                title="Positive EV Ops" 
                value={stats?.positiveEdgeCount?.toString() || "—"} 
                icon={<Sparkles className="size-5" />} 
                color="purple"
                sub="Ready for Builder"
              />
            </FadeIn>
            <FadeIn delay={0.4}>
              <StatCard 
                title="Primary Momentum" 
                value={stats?.topSport || "NBA"} 
                icon={<Zap className="size-5" />} 
                color="amber"
                sub="Current High Liquidity"
              />
            </FadeIn>
          </div>

          {/* ═══ Alpha Picks Board (Rithmm "Bolt" inspired) ═══ */}
          <div className="space-y-6">
            <div className="flex items-end justify-between px-2">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="size-5 text-amber-400 fill-amber-400" />
                  Alpha Picks
                  <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 border">
                    <Zap className="size-2.5 mr-1 fill-current" /> BOLT
                  </Badge>
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Highest-confidence projections from the PropEdge model
                  {activeSport !== "All" && <span className="text-primary ml-1">• {activeSport}</span>}
                </p>
              </div>
              <Link to="/props" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                Explore Full Analyzer <ChevronRight className="size-3" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
                ))}
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" stagger={0.05}>
                {filteredProps?.map((p: any) => {
                  const isAlpha = (p.confidence ?? 0) > 75 || Math.abs(p.edge) > 12;
                  return (
                    <StaggerItem key={p.id}>
                      <div className="relative">
                        {/* Alpha Bolt Badge */}
                        {isAlpha && (
                          <div className="absolute -top-2 -right-2 z-20">
                            <div className="relative">
                              <div className="size-8 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse">
                                <Zap className="size-4 text-black fill-current" />
                              </div>
                              <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
                            </div>
                          </div>
                        )}
                        <PremiumPropCard 
                          prop={{
                            id: p.id,
                            player: p.playerName,
                            image: p.playerImage || p.playerImageUrl,
                            color: (p.playerTeamColors as any)?.primary || p.playerTeamColor,
                            team: p.team,
                            sport: p.sport,
                            propType: p.statType,
                            line: p.line,
                            projection: p.projection || (p.line * (1 + p.edge / 100)),
                            edge: p.edge,
                            winProb: p.confidence || 65,
                            overOdds: -110,
                            underOdds: -110,
                            confidence: (p.confidence ?? 65) > 70 ? 'High' : 'Medium',
                          }}
                        />
                        {/* Rithmm-style Value Bar */}
                        <div className="mt-2 px-2">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                            <span className="text-muted-foreground/50">Value</span>
                            <span className={p.edge > 0 ? "text-emerald-400" : "text-red-400"}>
                              {p.edge > 0 ? "+" : ""}{p.edge?.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, Math.max(5, 50 + (p.edge || 0)))}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={cn(
                                "h-full rounded-full",
                                p.edge > 10 ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" :
                                p.edge > 0 ? "bg-emerald-400/60" : "bg-red-400/60"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </div>

          {/* Empty State */}
          {!loading && !hasData && (
             <PremiumEmptyState
                type="no-sync"
                title="Awaiting Data Broadcast"
                description="Connect your API providers to begin real-time edge processing."
                actionLabel="Configure Intelligence"
                onAction={() => window.location.href = "/data-sources"}
                providerStatus={[
                  { name: "The Odds API", status: "pending" },
                  { name: "SportsData.io", status: "pending" },
                ]}
              />
          )}
        </div>
      </div>
    </PageTransition>
  );
}

// ─── Stat Card ───

function StatCard({ title, value, icon, color, sub }: { title: string, value: string, icon: React.ReactNode, color: string, sub: string }) {
  const colorMap: Record<string, string> = {
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/20",
    emerald: "from-emerald-500 to-emerald-400 shadow-emerald-500/20",
    purple: "from-purple-600 to-purple-400 shadow-purple-500/20",
    amber: "from-amber-500 to-orange-400 shadow-amber-500/20"
  };

  const bgMap: Record<string, string> = {
    indigo: "text-indigo-400 bg-indigo-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    amber: "text-amber-400 bg-amber-500/10"
  };

  return (
    <div className="relative group overflow-hidden bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110", bgMap[color])}>
          {icon}
        </div>
        <div className="text-right">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
           <div className="text-2xl font-bold tracking-tighter text-white mt-1 font-mono">{value}</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground line-clamp-1">{sub}</span>
        <div className={cn("h-1 w-8 rounded-full bg-gradient-to-r", colorMap[color])} />
      </div>
      
      {/* Animated gradient accent */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/20 group-hover:w-full transition-all duration-500" />
    </div>
  );
}
