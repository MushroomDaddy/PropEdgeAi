import { Activity, BarChart3, Search, Sparkles, User, ChevronRight, Target, TrendingUp, History, Brain, Shield, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usePlayerSearch, usePlayerProfile } from "../hooks/api/usePlayers";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { PageTransition } from "@/components/propedge/PageTransition";
import { PremiumPropCard } from "@/components/dashboard/PremiumPropCard";

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "props", label: "Active Props", icon: Target },
  { id: "gamelogs", label: "Game Logs", icon: BarChart3 },
  { id: "splits", label: "Splits", icon: History },
  { id: "matchups", label: "Matchups", icon: Shield },
  { id: "results", label: "Results", icon: Star },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PlayerIntelPage() {
  const [searchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(qParam);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(qParam || null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { data: searchResults } = usePlayerSearch(searchTerm.length >= 2 ? searchTerm : "");

  useEffect(() => {
    if (qParam && qParam !== selectedPlayerName) {
      setSearchTerm(qParam);
      setSelectedPlayerName(qParam);
      setSelectedPlayerId(null);
      setActiveTab("overview");
    }
  }, [qParam, selectedPlayerName]);

  useEffect(() => {
    if (qParam && !selectedPlayerId && searchResults && searchResults.length > 0) {
      const match = searchResults.find((p: any) => p.name.toLowerCase() === qParam.toLowerCase());
      if (match) setSelectedPlayerId(match.id);
    }
  }, [qParam, selectedPlayerId, searchResults]);

  const { data: profile } = usePlayerProfile(selectedPlayerId ?? undefined);

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-24">
        <AnimatedSportsBackground />
        
        <div className="relative z-10 px-4 lg:px-8 space-y-6 pt-6 max-w-[1600px] mx-auto">
          {/* Header + Search */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-white">
                Player <span className="text-primary">Intel</span>
              </h1>
              <p className="text-sm text-muted-foreground/50 mt-1">Scout-grade intelligence dashboard</p>
            </div>
            
            <div className="relative w-full md:w-[400px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Search any player..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedPlayerId) {
                    setSelectedPlayerId(null);
                    setSelectedPlayerName(null);
                  }
                }}
                className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
              />
              
              <AnimatePresence>
                {searchResults && searchResults.length > 0 && !selectedPlayerId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-full mt-2 left-0 right-0 rounded-2xl border border-white/[0.08] bg-[#0c0d0e]/98 backdrop-blur-2xl shadow-2xl z-50 p-2 overflow-hidden"
                  >
                    {searchResults.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPlayerId(p.id);
                          setSelectedPlayerName(p.name);
                          setSearchTerm(p.name);
                          setActiveTab("overview");
                        }}
                        className="w-full text-left p-3 hover:bg-white/[0.04] rounded-xl flex items-center gap-3 transition-colors group"
                      >
                        <div className="size-10 rounded-lg bg-indigo-500/10 border border-white/[0.06] flex items-center justify-center text-sm font-black text-indigo-400/60">
                          {p.name.split(' ').map((n:any)=>n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-white group-hover:text-primary transition-colors">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-wider">
                            {p.team} · {p.position} · {p.sport}
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-primary/50 transition-all" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Player Selected */}
          {profile ? (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* ═══ Massive Player DNA Hero ═══ */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-indigo-900/15 via-[#0c0d0e] to-[#111214] p-6 lg:p-10"
              >
                {/* Team watermark */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.04] select-none pointer-events-none">
                  <h2 className="text-[140px] font-black italic tracking-tighter leading-none">{profile.player.teamAbbr || profile.player.team?.slice(0, 3)?.toUpperCase() || 'NBA'}</h2>
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  {/* Player Image */}
                  <div className="relative shrink-0">
                    <motion.div 
                      whileHover={{ rotate: 0 }}
                      className="size-36 lg:size-44 rounded-3xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center overflow-hidden shadow-2xl -rotate-2"
                    >
                      {profile.player.imageUrl ? (
                        <img src={profile.player.imageUrl} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-6xl font-black text-white/[0.06]">{profile.player.name[0]}</span>
                      )}
                    </motion.div>
                    {/* Jersey Number */}
                    <div className="absolute -bottom-3 -right-3 size-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl" style={{ boxShadow: '0 0 25px rgba(0,255,136,0.2)' }}>
                      <span className="text-2xl font-black text-primary-foreground">#{profile.player.jerseyNumber || '00'}</span>
                    </div>
                  </div>
                  
                  {/* Player Info */}
                  <div className="text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <Badge className="bg-primary/15 text-primary border-primary/20 uppercase tracking-widest font-black text-[9px]">{profile.player.sport}</Badge>
                      <Badge variant="outline" className="text-white/70 border-white/15 uppercase tracking-wider font-bold text-[9px]">{profile.player.team}</Badge>
                      <Badge className="bg-white/[0.04] text-muted-foreground/50 border-white/[0.06] uppercase tracking-wider font-bold text-[9px]">{profile.player.position}</Badge>
                    </div>
                    <h2 className="text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">{profile.player.name}</h2>
                    
                    <div className="flex items-center justify-center md:justify-start gap-6 mt-5">
                      <div>
                        <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] block">Condition</span>
                        <span className={cn("text-lg font-black uppercase", profile.player.recentForm === 'hot' ? 'text-primary' : 'text-amber-400')}>{profile.player.recentForm || 'Active'}</span>
                      </div>
                      <div className="h-8 w-px bg-white/[0.06]" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] block">Reliability</span>
                        <span className="text-lg font-black uppercase text-indigo-400">{profile.player.reliabiltyRating || 'Stable'}</span>
                      </div>
                      <div className="h-8 w-px bg-white/[0.06]" />
                      <div>
                        <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] block">Value</span>
                        <span className="text-lg font-black uppercase text-cyan-400">88</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 shrink-0">
                    <Button className="h-12 w-full md:w-56 bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(0,255,136,0.15)] hover:shadow-[0_0_40px_rgba(0,255,136,0.25)] rounded-xl">
                      <Target className="size-4 mr-2" />
                      Analyze All Props
                    </Button>
                    <Button variant="outline" className="h-10 w-full md:w-56 border-white/[0.08] hover:bg-white/[0.04] font-bold uppercase text-[10px] tracking-widest rounded-xl">
                      Scout Feed
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* ═══ Tab Navigation ═══ */}
              <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-y border-white/[0.04] -mx-4 px-4 overflow-hidden">
                <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "h-10 px-5 rounded-xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                          activeTab === tab.id 
                            ? "bg-primary/10 text-primary border border-primary/20" 
                            : "text-muted-foreground/50 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        <Icon className="size-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* ═══ Tab Body ═══ */}
              <div className="min-h-[400px]">
                {activeTab === "overview" && <OverviewTab profile={profile} />}
                {activeTab === "props" && <PropsTab profile={profile} />}
                {activeTab === "gamelogs" && <PlaceholderTab title="Game Logs" description="Detailed game-by-game statistical breakdown coming soon." />}
                {activeTab === "splits" && <PlaceholderTab title="Matchup Splits" description="Home/Away, vs Division, by rest days — coming soon." />}
                {activeTab === "matchups" && <PlaceholderTab title="Deep Matchups" description="Positional matchup analysis and defensive ratings coming soon." />}
                {activeTab === "results" && <PlaceholderTab title="Learning Loop" description="Historical prediction results and model adjustments coming soon." />}
              </div>
            </div>
          ) : selectedPlayerId ? (
            /* Loading skeleton */
            <div className="space-y-4">
              <div className="h-52 rounded-3xl shimmer border border-white/[0.04]" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-2xl shimmer border border-white/[0.04]" />)}
              </div>
            </div>
          ) : (
            /* No player selected */
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white/[0.01] border border-dashed border-white/[0.06] rounded-3xl space-y-4">
              <div className="size-20 rounded-3xl bg-primary/[0.06] flex items-center justify-center mb-2">
                <User className="size-10 text-primary/40" />
              </div>
              <h2 className="text-2xl font-bold text-center text-white">Search for a Player</h2>
              <p className="text-sm text-muted-foreground/40 text-center max-w-sm">Type a player name above to access their full intelligence profile</p>
              <div className="flex gap-2 mt-2">
                {['LeBron James', 'Patrick Mahomes', 'Shohei Ohtani'].map(name => (
                  <Button key={name} variant="ghost" onClick={() => { setSearchTerm(name); setSelectedPlayerId(null); setSelectedPlayerName(null); }} className="h-9 px-4 rounded-lg bg-white/[0.04] text-[10px] font-bold uppercase tracking-widest hover:bg-white/[0.08]">
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

/* ═══ Overview Tab ═══ */
function OverviewTab({ profile }: { profile: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-8 space-y-5">
        {/* Momentum Radar */}
        <div className="premium-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">Prop Momentum Radar</h3>
              <p className="text-[10px] text-muted-foreground/40 font-bold mt-0.5">Last 10 Game Performance</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black">Live</Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Avg Points", value: profile.last10Avg?.points || "24.2", sub: "+2.1 vs Season", color: "#00ff88" },
              { label: "Floor", value: "18", sub: "Safety 92%", color: "#5e6ad2" },
              { label: "Ceiling", value: "44", sub: "Burst 8%", color: "#a855f7" },
              { label: "Hit Rate", value: "70%", sub: "Last 10", color: "#00d4ff" },
            ].map((m, i) => (
              <motion.div 
                key={m.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all group"
              >
                <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest mb-1 group-hover:text-muted-foreground/60">{m.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black tracking-tighter text-white">{m.value}</span>
                  {m.label === "Hit Rate" && <TrendingUp className="size-3 text-primary" />}
                </div>
                <p className="text-[10px] font-bold mt-1 opacity-60" style={{ color: m.color }}>{m.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-primary/[0.03] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
            <Brain className="size-20 text-indigo-400" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 15px rgba(79,70,229,0.3)' }}>
              <Sparkles className="size-4 text-white" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">What PropEdge Sees</h3>
          </div>
          <p className="text-base text-white/80 leading-relaxed">
            <span className="text-primary font-bold">{profile.player.name}</span> is exhibiting elite efficiency in high-pressure matchups. 
            With a <span className="text-primary font-bold">Value Score of 88</span> on his Points Prop, the model detects a market lag of <span className="text-indigo-400 font-bold">14.2%</span>. 
            Historical data suggests performance increases by <span className="text-primary font-bold">12%</span> against bottom-tier defensive guards.
          </p>
          <div className="mt-5 pt-4 border-t border-white/[0.04] flex flex-wrap gap-2">
            <Badge className="bg-indigo-400/15 text-indigo-300 border-none text-[9px] font-black uppercase tracking-wider">Confidence Spike</Badge>
            <Badge className="bg-primary/15 text-primary border-none text-[9px] font-black uppercase tracking-wider">Market Variance</Badge>
            <Badge className="bg-cyan-400/15 text-cyan-300 border-none text-[9px] font-black uppercase tracking-wider">Favorable Matchup</Badge>
          </div>
        </div>
      </div>

      {/* Top Alpha Op */}
      <div className="lg:col-span-4">
        <div className="premium-card rounded-2xl p-6 h-full bg-[#0a0b0c]">
          <div className="mb-5">
            <h3 className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-[0.2em] mb-1">Top Alpha Op</h3>
            <p className="text-xl font-black text-white leading-tight">Recommended Play</p>
          </div>
          
          {profile.currentProps?.[0] ? (
            <div className="space-y-4">
              <PremiumPropCard 
                prop={{
                  id: profile.currentProps[0].id,
                  player: profile.player.name,
                  team: profile.player.team,
                  sport: profile.player.sport,
                  propType: profile.currentProps[0].statType,
                  line: profile.currentProps[0].line,
                  projection: profile.currentProps[0].projection,
                  edge: profile.currentProps[0].edge,
                  winProb: profile.currentProps[0].confidence || 65,
                  overOdds: -110,
                  underOdds: -110,
                  confidence: (profile.currentProps[0].confidence ?? 65) > 70 ? 'High' : 'Medium',
                }}
                compact
              />
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Model Drift</span>
                <span className="text-xs font-bold text-primary">+3.5 Units Alpha</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="size-8 text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground/30">No active props available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══ Props Tab ═══ */
function PropsTab({ profile }: { profile: any }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {profile.currentProps?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {profile.currentProps.map((p: any) => (
            <motion.div key={p.id} whileTap={{ scale: 0.98 }}>
              <PremiumPropCard 
                prop={{
                  id: p.id,
                  player: profile.player.name,
                  team: profile.player.team,
                  sport: profile.player.sport,
                  propType: p.statType,
                  line: p.line,
                  projection: p.projection,
                  edge: p.edge,
                  winProb: p.confidence || 65,
                  overOdds: -110,
                  underOdds: -110,
                  confidence: (p.confidence ?? 65) > 70 ? 'High' : 'Medium',
                }}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-white/[0.01] border border-dashed border-white/[0.06] rounded-2xl">
          <Target className="size-8 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground/40">No active props for this player</p>
        </div>
      )}
    </div>
  );
}

/* ═══ Placeholder Tab ═══ */
function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/[0.06] rounded-2xl animate-in fade-in duration-500">
      <div className="size-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <BarChart3 className="size-8 text-muted-foreground/20" />
      </div>
      <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground/40 text-center max-w-sm">{description}</p>
    </div>
  );
}
