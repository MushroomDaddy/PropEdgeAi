
import { useTopValue, usePropsStats, useProps } from '../hooks/api/useProps';
import { useUpcomingGames } from '../hooks/api/useGames';
import { useProviderStatus } from '../hooks/api/useProviders';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { motion } from "framer-motion";
import {
  Activity,
  ChevronRight,
  Eye,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
  Radio,
  Wifi,
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
import { cn } from '@/lib/utils';

const SPORTS = ["All", "NBA", "NFL", "MLB", "NHL", "NCAAB", "NCAAF", "Soccer"];

export function DashboardPage() {
  const [activeSport, setActiveSport] = useState("All");
  const stats = usePropsStats().data;
  const _unusedGames = useUpcomingGames().data; void _unusedGames;
  const allProps = useProps().data;
  const topValue = useTopValue(12).data;
  const { data: providers } = useProviderStatus();

  const loading = !allProps;
  const hasData = (allProps?.length ?? 0) > 0;
  const dataMode: "demo" | "live" | "hybrid" = "demo";

  const filteredProps = topValue?.filter((p: any) =>
    activeSport === "All" ? true : p.sport?.toUpperCase() === activeSport.toUpperCase()
  );

  const topEdge = filteredProps?.[0];

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-24">
        <AnimatedSportsBackground />
        
        <div className="relative z-10 px-4 lg:px-8 space-y-8 pt-6 max-w-[1600px] mx-auto">
          
          {/* ═══ Cinematic Hero: Today's Edge Board ═══ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0c0d0e] via-[#111214] to-[#0c0d0e] p-6 lg:p-8 shadow-2xl"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 grid-bg-fine opacity-30" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/[0.04] rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/[0.05] rounded-full blur-[80px]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"
                    style={{ boxShadow: '0 0 40px rgba(0,255,136,0.15)' }}
                  >
                    <Activity className="size-8 text-primary" />
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-[3px] border-[#0c0d0e] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-white">
                    Today's Edge Board
                  </h1>
                  <p className="text-sm text-muted-foreground/50 mt-1 flex items-center gap-2">
                    <Radio className="size-3 text-primary animate-pulse" />
                    Edge Intelligence Engine • v2.4.0
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sync Freshness */}
                <div className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">Sync Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-sm font-bold text-white">{providers?.length || 4} APIs Active</span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">2m ago</span>
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
                  className="h-10 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest px-5 shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.3)] transition-all rounded-xl"
                >
                  <Zap className="size-4 mr-2" />
                  Global Sync
                </Button>
              </div>
            </div>

            {/* Provider Health Strip */}
            <div className="relative z-10 flex items-center gap-2 mt-6 overflow-x-auto scrollbar-hide">
              {(providers || [
                { name: "The Odds API", status: "connected" },
                { name: "API-SPORTS", status: "connected" },
                { name: "TheSportsDB", status: "connected" },
                { name: "BallDontLie", status: "connected" },
                { name: "SerpApi", status: "pending" },
              ]).map((p: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04] shrink-0"
                >
                  <div className={cn(
                    "size-1.5 rounded-full",
                    p.status === "connected" ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-amber-500"
                  )} />
                  <span className="text-[10px] font-bold text-muted-foreground/60 whitespace-nowrap">{p.name}</span>
                  <Wifi className="size-2.5 text-muted-foreground/30" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ═══ Sport Selector Pills ═══ */}
          <div className="pill-selector">
            {SPORTS.map((sport) => (
              <button
                key={sport}
                onClick={() => setActiveSport(sport)}
                className={cn(
                  "pill-item",
                  activeSport === sport ? "pill-item-active" : "pill-item-inactive"
                )}
              >
                {activeSport === sport && (
                  <motion.div
                    layoutId="sport-pill-active"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{sport}</span>
              </button>
            ))}
          </div>

          {/* ═══ Core Stat Cards ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[
              { title: "Active Props", value: stats?.totalProps?.toLocaleString() || "—", icon: Target, color: "emerald", sub: `${stats?.sportCount || 12} Sports Tracked`, glow: "#00ff88" },
              { title: "Avg Edge", value: stats ? `+${stats.avgEdge}%` : "—", icon: TrendingUp, color: "cyan", sub: "High Conv Average", glow: "#00d4ff" },
              { title: "+EV Opportunities", value: stats?.positiveEdgeCount?.toString() || "—", icon: Sparkles, color: "purple", sub: "Builder Ready", glow: "#a855f7" },
              { title: "Top Momentum", value: stats?.topSport || "NBA", icon: Zap, color: "amber", sub: "Highest Liquidity", glow: "#ffb800" },
            ].map((s, i) => (
              <FadeIn key={i} delay={0.1 * (i + 1)}>
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="premium-card-glow p-5 rounded-2xl"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("p-2 rounded-xl transition-transform duration-300 group-hover:scale-110")} style={{ backgroundColor: `${s.glow}10`, color: s.glow }}>
                      <s.icon className="size-5" />
                    </div>
                  </div>
                  <p className="metric-label mb-1">{s.title}</p>
                  <motion.p 
                    className="text-2xl lg:text-3xl font-black tracking-tighter text-white font-mono"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    {s.value}
                  </motion.p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-muted-foreground/40 font-medium">{s.sub}</span>
                    <div className="h-1 w-8 rounded-full" style={{ background: `linear-gradient(90deg, ${s.glow}60, ${s.glow})` }} />
                  </div>
                </motion.div>
              </FadeIn>
            ))}
          </div>

          {/* ═══ Top Edge + Best Player + Steam Radar ═══ */}
          {topEdge && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Best Edge Card */}
              <FadeIn delay={0.2}>
                <div className="premium-card rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="size-4 text-primary fill-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">Top Edge Right Now</h3>
                      <p className="text-[10px] text-muted-foreground/40 font-bold">#1 Confidence Pick</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-lg font-black text-white/20 overflow-hidden">
                        {topEdge.playerImage ? (
                          <img src={topEdge.playerImage} className="h-full w-full object-cover" />
                        ) : (
                          topEdge.playerName?.split(' ').map((n: any) => n[0]).join('')
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{topEdge.playerName}</p>
                        <p className="text-[10px] text-muted-foreground/50 font-bold uppercase">{topEdge.team} · {topEdge.statType}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Edge</p>
                        <p className="text-2xl font-black text-primary">+{topEdge.edge?.toFixed(1)}%</p>
                      </div>
                      <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Line</p>
                        <p className="text-2xl font-black text-white">{topEdge.line}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Steam Radar Preview */}
              <FadeIn delay={0.3}>
                <div className="premium-card rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="size-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <Eye className="size-4 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">Steam Radar</h3>
                      <p className="text-[10px] text-muted-foreground/40 font-bold">Line Movement Alerts</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(filteredProps?.slice(0, 3) || []).map((p: any, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                          <span className="text-sm font-bold text-white/80">{p.playerName}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-400">{p.edge > 0 ? '+' : ''}{p.edge?.toFixed(1)}%</span>
                      </motion.div>
                    ))}
                    {(!filteredProps || filteredProps.length === 0) && (
                      <p className="text-sm text-muted-foreground/30 text-center py-4">No steam moves detected</p>
                    )}
                  </div>
                  <Link to="/props" className="flex items-center gap-1 text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-4 hover:text-cyan-300 transition-colors">
                    Full Radar <ChevronRight className="size-3" />
                  </Link>
                </div>
              </FadeIn>

              {/* Watchlist Preview */}
              <FadeIn delay={0.4}>
                <div className="premium-card rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Star className="size-4 text-amber-400 fill-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">Quick Watchlist</h3>
                      <p className="text-[10px] text-muted-foreground/40 font-bold">Tracked Players</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(filteredProps?.slice(0, 4) || []).map((p: any, i: number) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 * i }}
                        className="flex items-center gap-3 py-1.5"
                      >
                        <div className="size-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-[10px] font-black text-white/20">
                          {p.playerName?.split(' ').map((n: any) => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white/80 truncate">{p.playerName}</p>
                          <p className="text-[9px] text-muted-foreground/40">{p.statType}</p>
                        </div>
                        <Badge className="h-5 text-[9px] font-black border-none bg-primary/10 text-primary">
                          {p.edge > 0 ? '+' : ''}{p.edge?.toFixed(0)}%
                        </Badge>
                      </motion.div>
                    ))}
                    {(!filteredProps || filteredProps.length === 0) && (
                      <p className="text-sm text-muted-foreground/30 text-center py-4">Add players to watchlist</p>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>
          )}

          {/* ═══ Alpha Picks Grid ═══ */}
          <div className="space-y-5">
            <div className="flex items-end justify-between px-1">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2 text-white">
                  <Zap className="size-5 text-amber-400 fill-amber-400" />
                  Alpha Picks
                  <Badge className="bg-amber-400/10 text-amber-400 border-amber-400/20 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 border ml-1">
                    <Zap className="size-2.5 mr-1 fill-current" /> BOLT
                  </Badge>
                </h2>
                <p className="text-sm text-muted-foreground/40 mt-1">
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
                  <div key={i} className="h-72 rounded-2xl shimmer border border-white/[0.04]" />
                ))}
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" stagger={0.04}>
                {filteredProps?.map((p: any) => {
                  const isAlpha = (p.confidence ?? 0) > 75 || Math.abs(p.edge) > 12;
                  return (
                    <StaggerItem key={p.id}>
                      <div className="relative">
                        {isAlpha && (
                          <div className="absolute -top-2 -right-2 z-20">
                            <motion.div 
                              animate={{ scale: [1, 1.1, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="size-7 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                            >
                              <Zap className="size-3.5 text-black fill-current" />
                            </motion.div>
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
                            source: p.source,
                            riskLevel: p.edge > 15 ? 'Low' : p.edge > 5 ? 'Medium' : 'High',
                          }}
                        />
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
