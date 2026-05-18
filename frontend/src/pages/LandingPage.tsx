
import { useEffect, useState } from "react";
import { supabase } from "../lib/api";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { cn } from "@/lib/utils";

export function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session);
      setIsLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden bg-[#08090a] min-h-screen">
      <AnimatedSportsBackground />
      
      {/* HUD Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl border-b border-white/5 bg-[#08090a]/50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                    <Zap className="size-5 text-white fill-current" />
                  </div>
                  <span className="text-white font-black text-xl italic tracking-tighter uppercase">
                    PROP<span className="text-primary font-[900]">EDGE</span>
                  </span>
              </div>
              
              <div className="flex items-center gap-6">
                  {!isAuthenticated && !isLoading && (
                      <>
                        <Link to="/login" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">Sign In</Link>
                        <Button className="h-10 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6 shadow-2xl rounded-xl" asChild>
                            <Link to="/signup">Initialize</Link>
                        </Button>
                      </>
                  )}
                  {isAuthenticated && (
                     <Button className="h-10 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-2xl rounded-xl" asChild>
                        <Link to="/dashboard">Console</Link>
                     </Button>
                  )}
              </div>
          </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-4 pt-40 pb-20 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Signal Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
          >
             <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Signal: Operational</span>
             <ChevronRight className="size-3 text-primary" />
          </motion.div>

          {/* Epic Headline */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] uppercase italic"
          >
            <span className="text-white drop-shadow-2xl font-[900]">OWN THE</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">
              MARKET EDGE
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-[#f7f8f8] max-w-2xl mx-auto leading-relaxed font-medium uppercase tracking-[0.2em]"
          >
            Elite sports intelligence utilizing institutional-grade data modeling to find high-value market opportunities.
          </motion.p>

          {!isAuthenticated && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
            >
              <Button
                size="lg"
                className="h-16 px-12 bg-primary text-primary-foreground font-black italic uppercase text-lg shadow-[0_0_60px_rgba(0,255,136,0.2)] hover:scale-105 transition-all rounded-3xl"
                asChild
              >
                <Link to="/signup">
                  Get The Edge
                  <ArrowRight className="size-5 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-12 border-white/10 text-white font-black italic uppercase text-lg hover:bg-white/5 transition-all rounded-3xl backdrop-blur-xl"
                asChild
              >
                <Link to="/login">Access App</Link>
              </Button>
            </motion.div>
          )}

          <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatTicker label="Tracking Nodes" value="482" prefix="+" color="indigo" />
            <StatTicker label="Active Props" value="14.2k" color="primary" />
            <StatTicker label="Alpha Rating" value="88.4" color="purple" />
            <StatTicker label="Latency" value="2.4ms" color="emerald" />
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-32 relative z-10 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
                icon={TrendingUp} 
                title="Deep Analysis" 
                desc="Real-time edge calculations across every major platform." 
                color="primary"
            />
            <FeatureCard 
                icon={Bot} 
                title="AI Intelligence" 
                desc="24/7 sports analyst for deep matchup and stat research." 
                color="indigo"
            />
            <FeatureCard 
                icon={Target} 
                title="Smart Builder" 
                desc="Optimized entry construction with correlation guardrails." 
                color="purple"
            />
          </div>
      </section>
      
      <footer className="p-12 border-t border-white/5 relative z-10 bg-[#08090a]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-3 opacity-40">
                  <Zap className="size-5 text-primary fill-current" />
                  <span className="font-black italic text-lg text-white uppercase tracking-tighter">PROPEDGE</span>
               </div>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">© 2026. FOR ENTERTAINMENT PURPOSES ONLY.</p>
          </div>
      </footer>
    </div>
  );
}

function StatTicker({ label, value, prefix, color }: any) {
    const colorClass = color === 'primary' ? 'text-primary' : color === 'indigo' ? 'text-indigo-400' : color === 'purple' ? 'text-purple-400' : 'text-emerald-400';
    return (
        <div className="space-y-1">
            <div className={`text-4xl font-black tracking-tighter italic ${colorClass}`}>
                {prefix && <span className="opacity-50 text-2xl mr-1">{prefix}</span>}
                {value}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{label}</p>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
    const bgClass = color === 'primary' ? 'bg-primary text-primary-foreground' : color === 'indigo' ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white';
    return (
        <div className="relative group p-8 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-500 overflow-hidden">
            <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 shadow-2xl", bgClass)}>
                <Icon className="size-7" />
            </div>
            <h3 className="text-xl font-black italic uppercase text-white mb-4 tracking-tighter">{title}</h3>
            <p className="text-sm font-bold text-muted-foreground leading-relaxed uppercase tracking-wider opacity-60 group-hover:opacity-100">{desc}</p>
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-700" />
        </div>
    );
}
