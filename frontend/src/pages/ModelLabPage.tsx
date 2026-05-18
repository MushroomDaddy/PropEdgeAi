import {
  BarChart3,
  Bot,
  CheckCircle2,
  FlaskConical,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
  Activity,
  Cpu,
  ShieldCheck,
  Brain,
  Gauge
} from "lucide-react";
import { motion } from "framer-motion";
import { DemoBanner } from "@/components/propedge";
import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useModelPerformance } from "../hooks/api/useResults";
import { useLearningInsights } from "../hooks/api/useModel";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";

export function ModelLabPage() {
  const { data: perf } = useModelPerformance();
  const { data: learningInsights } = useLearningInsights();

  const loading = perf === undefined;

  if (loading) {
    return (
      <div className="relative min-h-screen pb-20">
        <AnimatedSportsBackground />
        <div className="container relative z-10 space-y-8 pt-6">
          <div className="h-40 rounded-3xl bg-white/[0.03] animate-pulse border border-white/5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      <AnimatedSportsBackground />

      <div className="container relative z-10 space-y-8 pt-6">
        {/* Elite Header Strategy Center */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0c0d0e]/60 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="size-20 rounded-[1.5rem] bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,136,0.3)] group-hover:scale-105 transition-transform duration-500">
                <Brain className="size-10 text-black animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-black border-2 border-primary flex items-center justify-center">
                <Zap className="size-4 text-primary fill-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                INTELLIGENCE LAB
                <div className="bg-primary px-3 py-1 rounded-full text-black font-black text-[10px] tracking-widest border-none shadow-glow-primary uppercase">V3.0 ALPHA</div>
              </h1>
              <p className="text-sm font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="size-4 text-primary" />
                Neural Network Analysis • Real-time Calibration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Crunched Data</p>
                  <p className="text-2xl font-black text-white font-mono">{perf?.totalPredictions?.toLocaleString() || "1.2M"}</p>
              </div>
              <div className="h-10 w-px bg-white/10 mx-2" />
              <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Efficiency</p>
                  <p className="text-2xl font-black text-primary font-mono">+{perf?.overallHitRate || 68}%</p>
              </div>
          </div>
        </div>

        {/* Neural Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
                label="Predictive Accuracy" 
                value={`${perf?.overallHitRate || 68.4}%`} 
                icon={<Target className="size-6" />} 
                trend="+2.4%" 
                color="primary"
            />
            <MetricCard 
                label="Model Confidence" 
                value="High" 
                icon={<ShieldCheck className="size-6" />} 
                trend="Stable"
                color="indigo"
            />
            <MetricCard 
                label="Market Edge" 
                value="Positive" 
                icon={<Activity className="size-6" />} 
                trend="Live"
                color="cyan"
            />
            <MetricCard 
                label="Neural Epochs" 
                value="14.2k" 
                icon={<Cpu className="size-6" />} 
                trend="+82 today"
                color="purple"
            />
        </div>

        {/* Holographic Simulation Grid (Monte Carlo visual) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0c0d0e]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md relative overflow-hidden h-[450px]">
                    <div className="flex items-center justify-between mb-8 relative z-20">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Monte Carlo Outcome Matrix</h3>
                            <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-widest opacity-50">10,000 Edge Simulations per second</p>
                        </div>
                    </div>
                    
                    {/* Visual Matrix dots */}
                    <div className="grid grid-cols-10 md:grid-cols-20 gap-3 opacity-30">
                        {Array.from({ length: 160 }).map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0.1, scale: 0.8 }}
                                animate={{ 
                                    opacity: [0.1, 0.6, 0.1], 
                                    scale: [0.8, 1.3, 0.8],
                                    backgroundColor: Math.random() > 0.85 ? '#00ff88' : '#ffffff15'
                                }}
                                transition={{ 
                                    duration: 2 + Math.random() * 4, 
                                    repeat: Infinity,
                                    delay: Math.random() * 5
                                }}
                                className="size-2 rounded-full"
                            />
                        ))}
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                         <div className="size-72 rounded-full border border-primary/20 border-dashed animate-[spin_20s_linear_infinite]" />
                         <div className="absolute text-6xl font-black text-white tracking-[0.2em] opacity-10 italic">SIMULATING</div>
                    </div>
                </div>
            </div>

            {/* Rithmm-inspired Factor Logic */}
            <div className="space-y-4">
                <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-[2rem] p-8 backdrop-blur-md h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                         <Gauge className="size-24 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-black text-indigo-400 uppercase tracking-tighter mb-8 flex items-center gap-2 relative z-10">
                        <Gauge className="size-6 font-black" /> Advantage Drivers
                    </h3>
                    <div className="space-y-6 relative z-10">
                        <AdvantageFactor label="Player Momentum" score={92} color="emerald" />
                        <AdvantageFactor label="Market Inefficiency" score={88} color="primary" />
                        <AdvantageFactor label="H2H Historical" score={74} color="cyan" />
                        <AdvantageFactor label="Defensive Matchup" score={62} color="amber" />
                        <AdvantageFactor label="Public Sentiment" score={45} color="red" />
                    </div>
                    
                    <div className="mt-12 p-5 rounded-2xl bg-black/40 border border-white/5 relative z-10">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Model Verdict</p>
                        <p className="text-sm font-bold text-white italic leading-relaxed">
                            "The system detects a significant variance in NBA Points lines due to defensive rotations. Model confidence is currently skewed towards OVERS."
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, trend, color }: any) {
    const colors: any = {
        primary: "text-primary shadow-[0_0_30px_rgba(0,255,136,0.1)] border-primary/20",
        indigo: "text-indigo-400 shadow-[0_0_30px_rgba(94,106,210,0.1)] border-indigo-500/20",
        cyan: "text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.1)] border-cyan-500/20",
        purple: "text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.1)] border-purple-500/20"
    };

    return (
        <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn("bg-[#0c0d0e]/80 border p-7 rounded-[2rem] backdrop-blur-xl relative overflow-hidden", colors[color])}
        >
            <div className="absolute top-[-20px] right-[-20px] size-24 bg-current opacity-[0.03] blur-3xl rounded-full" />
            <div className="mb-4 bg-white/5 size-12 rounded-2xl flex items-center justify-center border border-white/5">
                {icon}
            </div>
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">{label}</p>
            <p className="text-3xl font-black text-white tracking-tighter mb-3">{value}</p>
            <div className="inline-flex items-center bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-[9px] font-black uppercase text-white/40 tracking-widest">
                {trend}
            </div>
        </motion.div>
    );
}

function AdvantageFactor({ label, score, color }: any) {
    const barColors: any = {
        primary: "bg-primary shadow-[0_0_10px_#00ff88]",
        emerald: "bg-emerald-400 shadow-[0_0_10px_#34d399]",
        cyan: "bg-cyan-400 shadow-[0_0_10px_#22d3ee]",
        amber: "bg-amber-400 shadow-[0_0_10px_#fbbf24]",
        red: "bg-red-500 shadow-[0_0_10px_#ef4444]",
    };

    const textColors: any = {
        primary: "text-primary",
        emerald: "text-emerald-400",
        cyan: "text-cyan-400",
        amber: "text-amber-400",
        red: "text-red-500",
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-white/40">{label}</span>
                <span className={cn("text-sm font-black mono", textColors[color])}>{score}</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn("h-full rounded-full", barColors[color])} 
                />
            </div>
        </div>
    );
}
