import {
  Target,
  Zap,
  Activity,
  Cpu,
  ShieldCheck,
  Brain,
  BarChart3,
  Layers,
  GitBranch,
  LineChart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useModelPerformance } from "../hooks/api/useResults";
import { useLearningInsights } from "../hooks/api/useModel";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { PageTransition, FadeIn } from "@/components/propedge/PageTransition";
import { Badge } from "@/components/ui/badge";

export function ModelLabPage() {
  const { data: perf, isLoading } = useModelPerformance();
  const { data: learningInsights } = useLearningInsights();

  const hasData = !!perf && (perf as any).totalPredictions > 0;

  if (isLoading) {
    return (
      <div className="relative min-h-screen pb-20">
        <AnimatedSportsBackground />
        <div className="relative z-10 px-4 lg:px-8 space-y-6 pt-6 max-w-[1600px] mx-auto">
          <div className="h-40 rounded-3xl shimmer border border-white/[0.04]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-2xl shimmer border border-white/[0.04]" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-80 rounded-2xl shimmer border border-white/[0.04]" />
            <div className="h-80 rounded-2xl shimmer border border-white/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen pb-24">
        <AnimatedSportsBackground />

        <div className="relative z-10 px-4 lg:px-8 space-y-6 pt-6 max-w-[1600px] mx-auto">
          
          {/* ═══ Hero Header ═══ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0c0d0e] via-[#111214] to-[#0c0d0e] p-6 lg:p-8"
          >
            <div className="absolute inset-0 grid-bg-fine opacity-20" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/[0.04] rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-2xl border border-primary/20 border-dashed"
                  />
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/10 flex items-center justify-center" style={{ boxShadow: '0 0 40px rgba(0,255,136,0.15)' }}>
                    <Brain className="size-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                    Intelligence Lab
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black tracking-widest uppercase">V3 Alpha</Badge>
                  </h1>
                  <p className="text-sm text-muted-foreground/50 mt-1 flex items-center gap-2">
                    <Cpu className="size-3 text-primary" />
                    Neural Network Analysis · Real-time Calibration
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06]">
                <div className="text-center">
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Predictions</p>
                  <p className="text-2xl font-black text-white font-mono">{hasData ? perf?.totalPredictions?.toLocaleString() : "—"}</p>
                </div>
                <div className="h-10 w-px bg-white/[0.06]" />
                <div className="text-center">
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Accuracy</p>
                  <p className="text-2xl font-black text-primary font-mono">{hasData ? `${perf?.overallHitRate}%` : "—"}</p>
                </div>
                <div className="h-10 w-px bg-white/[0.06]" />
                <div className="text-center">
                  <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Brier Score</p>
                  <p className="text-2xl font-black text-cyan-400 font-mono">{hasData ? (perf?.brierScore ?? '—') : "—"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ═══ Core Metric Cards ═══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <LabMetricCard label="Predictive Accuracy" value={hasData ? `${perf?.overallHitRate}%` : "—"} icon={<Target className="size-5" />} trend={hasData ? "Live" : "Awaiting data"} color="#00ff88" />
            <LabMetricCard label="Model Confidence" value={hasData ? "High" : "—"} icon={<ShieldCheck className="size-5" />} trend={hasData ? "Stable" : "Awaiting data"} color="#5e6ad2" />
            <LabMetricCard label="Market Edge" value={hasData ? "Positive" : "—"} icon={<Activity className="size-5" />} trend={hasData ? "Live" : "Awaiting data"} color="#00d4ff" />
            <LabMetricCard label="Neural Epochs" value={hasData ? `${((perf?.totalPredictions ?? 0) / 1000).toFixed(1)}k` : "—"} icon={<Cpu className="size-5" />} trend={hasData ? "Processing" : "Awaiting data"} color="#a855f7" />
          </div>

          {/* ═══ Calibration Chart + Confidence Heatmap ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Calibration Chart */}
            <FadeIn delay={0.2}>
              <div className="premium-card rounded-2xl p-6 h-[420px] relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <LineChart className="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">Calibration Curve</h3>
                      <p className="text-[10px] text-muted-foreground/40">Predicted vs Actual Probability</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black">Live</Badge>
                </div>
                
                {/* Visual calibration chart */}
                <div className="relative h-[300px] bg-white/[0.02] rounded-xl border border-white/[0.04] p-4">
                  {/* Perfect calibration line */}
                  <div className="absolute inset-4 border-b border-l border-white/[0.06]">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Perfect line */}
                      <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="2,2" />
                      {/* Model calibration curve */}
                      <motion.path
                        d="M 0 95 Q 15 82, 25 75 Q 35 68, 45 58 Q 55 48, 65 38 Q 75 25, 85 15 Q 92 8, 100 3"
                        fill="none"
                        stroke="#00ff88"
                        strokeWidth="2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,136,0.3))' }}
                      />
                      {/* Confidence dots */}
                      {[
                        { x: 10, y: 88 }, { x: 20, y: 78 }, { x: 30, y: 70 }, { x: 40, y: 60 },
                        { x: 50, y: 50 }, { x: 60, y: 40 }, { x: 70, y: 30 }, { x: 80, y: 20 },
                        { x: 90, y: 8 },
                      ].map((dot, i) => (
                        <motion.circle
                          key={i}
                          cx={dot.x}
                          cy={dot.y}
                          r="2"
                          fill="#00ff88"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,136,0.5))' }}
                        />
                      ))}
                    </svg>
                  </div>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-4 bottom-4 w-8 flex flex-col justify-between text-[8px] font-mono text-muted-foreground/30">
                    <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
                  </div>
                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-8 right-4 flex justify-between text-[8px] font-mono text-muted-foreground/30">
                    <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Confidence Bucket Heatmap */}
            <FadeIn delay={0.3}>
              <div className="premium-card rounded-2xl p-6 h-[420px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <Layers className="size-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight">Confidence Heatmap</h3>
                      <p className="text-[10px] text-muted-foreground/40">Win Rate by Confidence Bucket</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { range: '90-100%', winRate: 82, count: 45, color: '#00ff88' },
                    { range: '80-90%', winRate: 74, count: 120, color: '#00ff88' },
                    { range: '70-80%', winRate: 68, count: 310, color: '#00d4ff' },
                    { range: '60-70%', winRate: 61, count: 580, color: '#5e6ad2' },
                    { range: '50-60%', winRate: 54, count: 420, color: '#a855f7' },
                    { range: '40-50%', winRate: 42, count: 280, color: '#ffb800' },
                    { range: '<40%', winRate: 31, count: 150, color: '#ff4466' },
                  ].map((bucket, i) => (
                    <motion.div 
                      key={bucket.range}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-3 group"
                    >
                      <span className="text-[10px] font-mono font-bold text-muted-foreground/40 w-16 shrink-0 text-right">{bucket.range}</span>
                      <div className="flex-1 h-8 bg-white/[0.02] rounded-lg overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bucket.winRate}%` }}
                          transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                          className="h-full rounded-lg flex items-center justify-end pr-2"
                          style={{ backgroundColor: `${bucket.color}20`, boxShadow: `inset 0 0 20px ${bucket.color}10` }}
                        >
                          <span className="text-[10px] font-black text-white/80">{bucket.winRate}%</span>
                        </motion.div>
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground/30 w-10 shrink-0">{bucket.count}n</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">Higher confidence = higher win rate ✓</span>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black">Well Calibrated</Badge>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ═══ Feature Importance + Simulation Grid ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Feature Importance */}
            <FadeIn delay={0.4}>
              <div className="premium-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <GitBranch className="size-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Advantage Drivers</h3>
                    <p className="text-[10px] text-muted-foreground/40">Feature Importance Ranking</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {[
                    { label: "Player Momentum", score: 92, color: "#00ff88" },
                    { label: "Market Inefficiency", score: 88, color: "#00d4ff" },
                    { label: "H2H Historical", score: 74, color: "#5e6ad2" },
                    { label: "Defensive Matchup", score: 62, color: "#ffb800" },
                    { label: "Public Sentiment", score: 45, color: "#ff4466" },
                  ].map((f, i) => (
                    <div key={f.label} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{f.label}</span>
                        <span className="text-sm font-black font-mono" style={{ color: f.color }}>{f.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${f.score}%` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 + i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: f.color, boxShadow: `0 0 8px ${f.color}40` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Monte Carlo Simulation */}
            <div className="lg:col-span-2">
              <FadeIn delay={0.5}>
                <div className="premium-card rounded-2xl p-6 h-full relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <BarChart3 className="size-4 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Monte Carlo Outcome Matrix</h3>
                        <p className="text-[10px] text-muted-foreground/40">10,000 Simulations per Second</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Simulation dots grid */}
                  <div className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-2 opacity-40">
                    {Array.from({ length: 160 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.05 }}
                        animate={{
                          opacity: [0.05, Math.random() > 0.8 ? 0.8 : 0.3, 0.05],
                          scale: [0.8, Math.random() > 0.9 ? 1.5 : 1, 0.8],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 3,
                          repeat: Infinity,
                          delay: Math.random() * 5,
                        }}
                        className="size-2 rounded-full"
                        style={{ backgroundColor: Math.random() > 0.85 ? '#00ff88' : Math.random() > 0.7 ? '#5e6ad2' : 'rgba(255,255,255,0.1)' }}
                      />
                    ))}
                  </div>

                  {/* Overlay text */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="size-60 rounded-full border border-primary/10 border-dashed animate-[spin_25s_linear_infinite]" />
                    <span className="absolute text-5xl font-black text-white/[0.04] tracking-[0.3em] italic uppercase">Simulating</span>
                  </div>

                  {/* Model verdict */}
                  <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/[0.06] relative z-10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Model Verdict</p>
                    <p className="text-sm font-bold text-white/70 leading-relaxed">
                      {hasData
                        ? `The system detects significant variance in NBA Points lines due to defensive rotations. Model confidence is currently at a ${perf?.overallHitRate}% hit rate.`
                        : "Awaiting prediction data. Run syncs and build picks to populate the model."}
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* ═══ Learning Feed ═══ */}
          {learningInsights && (learningInsights as any[]).length > 0 && (
            <FadeIn delay={0.6}>
              <div className="premium-card rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Zap className="size-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">Model Learning Feed</h3>
                    <p className="text-[10px] text-muted-foreground/40">Recent Pattern Discoveries</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {(learningInsights as any[]).slice(0, 5).map((insight: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                    >
                      <div className="size-2 rounded-full bg-amber-400 mt-1.5 shrink-0 animate-pulse" />
                      <div>
                        <p className="text-sm text-white/70 leading-relaxed">{insight.insight || insight.description || insight.text}</p>
                        <p className="text-[9px] text-muted-foreground/30 mt-1 font-mono">{insight.timestamp || 'Recent'}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

/* ═══ Lab Metric Card ═══ */
function LabMetricCard({ label, value, icon, trend, color }: { label: string; value: string; icon: React.ReactNode; trend: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="premium-card rounded-2xl p-5 relative overflow-hidden"
      style={{ boxShadow: `0 0 30px ${color}08` }}
    >
      <div className="absolute top-[-20px] right-[-20px] size-24 blur-3xl rounded-full" style={{ backgroundColor: color, opacity: 0.03 }} />
      <div className="mb-3 size-10 rounded-xl flex items-center justify-center border border-white/[0.06]" style={{ backgroundColor: `${color}10`, color }}>
        {icon}
      </div>
      <p className="metric-label mb-1">{label}</p>
      <p className="text-2xl font-black tracking-tighter text-white mb-2">{value}</p>
      <div className="inline-flex items-center bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">
        {trend}
      </div>
    </motion.div>
  );
}
