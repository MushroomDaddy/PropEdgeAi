import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Zap, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PropCardProps {
  prop: {
    id: string;
    player: string;
    image?: string;
    color?: string;
    team?: string;
    sport?: string;
    propType: string;
    line: number;
    projection: number;
    edge: number;
    winProb: number;
    overOdds: number;
    underOdds: number;
    confidence: 'High' | 'Medium' | 'Low';
    lastUpdated?: string;
  };
}

export const PremiumPropCard: React.FC<PropCardProps> = ({ prop }) => {
  const isPositiveEdge = prop.edge > 0;
  const teamColor = prop.color || '#5e6ad2'; // Default to Indigo
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0c0d0e] p-4 transition-all duration-300 hover:bg-[#111214] hover:border-white/20 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Dynamic Team Color Glow */}
      <div 
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-[50px] group-hover:opacity-40 transition-all duration-500" 
        style={{ backgroundColor: teamColor }}
      />

      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Header: Player & Context */}
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-white/10 bg-[#1a1b1e] flex items-center justify-center font-bold text-white/40 overflow-hidden shadow-2xl">
              {prop.image ? (
                <img src={prop.image} alt={prop.player} className="h-full w-full object-cover scale-110" />
              ) : (
                prop.player.split(' ').map(n => n[0]).join('')
              )}
            </div>
            {/* Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-[#0c0d0e] shadow-glow-green" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors leading-tight line-clamp-1 tracking-tight">{prop.player}</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-0.5">
              <span className="text-white/80">{prop.team || 'NBA'}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{prop.sport || 'Basketball'}</span>
            </div>
          </div>
        </div>
        <Badge 
          variant={isPositiveEdge ? 'success' : 'destructive'} 
          className="h-7 gap-1.5 font-black text-[10px] tracking-widest uppercase border-none shadow-lg px-2"
          style={{ backgroundColor: isPositiveEdge ? '#00ff8820' : '#ff444420', color: isPositiveEdge ? '#00ff88' : '#ff4444' }}
        >
          {isPositiveEdge ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(prop.edge)}% EDGE
        </Badge>
      </div>

      {/* Main Prop Info - Premium Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-px rounded-xl bg-white/5 p-px border border-white/10 overflow-hidden shadow-inner">
        <div className="bg-[#0c0d0e]/80 p-3 flex flex-col items-center justify-center">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">{prop.propType}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tighter text-white">{prop.line}</span>
            <span className="text-[10px] text-muted-foreground font-black uppercase">LINE</span>
          </div>
        </div>
        <div className="bg-[#0c0d0e]/80 p-3 flex flex-col items-center justify-center">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-1">PROJECTION</p>
          <div className="flex items-baseline gap-1 text-primary">
            <span className="text-3xl font-black tracking-tighter shadow-glow-primary">{prop.projection}</span>
            <Zap className="h-4 w-4 fill-current animate-pulse" />
          </div>
        </div>
      </div>

      {/* Probability & Insights */}
      <div className="relative z-10 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          {/* High-End Visual Prob Gauge */}
          <div className="relative h-12 w-12 group/gauge">
            <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="16"
                className="stroke-white/5 fill-none"
                strokeWidth="3"
              />
              <motion.circle
                cx="18" cy="18" r="16"
                className="stroke-primary fill-none"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${prop.winProb}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ filter: 'drop-shadow(0 0 6px #00ff88)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] font-black tracking-tighter text-white">{prop.winProb}%</span>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black text-muted-foreground/60 leading-none uppercase tracking-widest">Win Probability</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                prop.confidence === 'High' ? "bg-primary shadow-glow-primary" : "bg-amber-400 shadow-glow-amber"
              )} />
              <p className={cn(
                "text-[10px] font-black uppercase tracking-tighter",
                prop.confidence === 'High' ? "text-primary" : "text-amber-400"
              )}>
                {prop.confidence} CONFIDENCE
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-[10px] font-black text-white/40 font-mono">
            <span className="bg-white/5 px-1 rounded">O: {prop.overOdds}</span>
            <span className="bg-white/5 px-1 rounded">U: {prop.underOdds}</span>
          </div>
          <p className="flex items-center justify-end gap-1 text-[9px] font-bold text-muted-foreground/40 mt-2 uppercase tracking-tight">
            <Clock className="h-2.5 w-2.5" />
            Updated {prop.lastUpdated || '2m ago'}
          </p>
        </div>
      </div>

      {/* Premium Footer Actions */}
      <div className="relative z-10 mt-2 flex gap-2">
        <Button variant="outline" size="sm" className="h-10 flex-1 bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-[10px] font-black uppercase tracking-[0.1em] text-white/70">
          Analytics
        </Button>
        <Button size="sm" className="h-10 flex-1 bg-primary text-black hover:bg-white text-[10px] font-black uppercase tracking-[0.1em] gap-1.5 shadow-[0_0_20px_rgba(0,255,136,0.35)] border-none">
          <Target className="h-4 w-4" />
          LOCK PICK
        </Button>
      </div>

      {/* Animated Edge Accent */}
      <motion.div 
        className="absolute bottom-0 left-0 h-1 bg-primary/60"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.4, ease: "circOut" }}
      />
      
      {/* Glass Shine Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] rotate-45 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
    </motion.div>
  );
};