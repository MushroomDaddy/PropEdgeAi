import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Zap, Clock, Shield, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatLabel } from '@/lib/labels';

interface PropCardProps {
  prop: {
    id: string;
    player: string;
    image?: string;
    color?: string;
    team?: string;
    sport?: string;
    position?: string;
    propType: string;
    line: number;
    projection: number;
    edge: number;
    winProb: number;
    marketImplied?: number;
    overOdds: number;
    underOdds: number;
    confidence: 'High' | 'Medium' | 'Low';
    lastUpdated?: string;
    source?: string;
    riskLevel?: 'Low' | 'Medium' | 'High';
  };
  onAnalytics?: () => void;
  onAddBuilder?: () => void;
  compact?: boolean;
}

export const PremiumPropCard: React.FC<PropCardProps> = ({ prop, onAnalytics, onAddBuilder, compact }) => {
  const isPositiveEdge = prop.edge > 0;
  const teamColor = prop.color || '#5e6ad2';
  const confidenceColor = prop.confidence === 'High' ? '#00ff88' : prop.confidence === 'Medium' ? '#ffb800' : '#ff4466';
  const riskColor = prop.riskLevel === 'Low' ? '#00ff88' : prop.riskLevel === 'High' ? '#ff4466' : '#ffb800';
  
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-[#0c0d0e] overflow-hidden cursor-pointer"
      style={{ 
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Team Color Top Accent */}
      <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${teamColor}40, ${teamColor}, ${teamColor}40)` }} />

      {/* Dynamic Team Color Glow */}
      <div 
        className="absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-15 blur-[60px] group-hover:opacity-30 transition-all duration-700" 
        style={{ backgroundColor: teamColor }}
      />

      {/* Hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] rotate-45 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" style={{ animation: 'shimmer 2s ease-out forwards' }} />
      </div>

      <div className={cn("relative z-10 flex flex-col gap-3", compact ? "p-3" : "p-4")}>
        {/* Header: Player + Edge Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Player Avatar */}
            <div className="relative shrink-0">
              <div 
                className="h-12 w-12 rounded-xl border border-white/10 bg-[#1a1b1e] flex items-center justify-center overflow-hidden shadow-lg"
                style={{ boxShadow: `0 0 20px ${teamColor}15` }}
              >
                {prop.image ? (
                  <img src={prop.image} alt={prop.player} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-white/30 italic">
                    {prop.player.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              {/* Live dot */}
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#0c0d0e]" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.5)' }} />
            </div>

            <div className="min-w-0">
              <h3 className="font-bold text-[15px] text-white leading-tight truncate group-hover:text-primary transition-colors duration-300">
                {prop.player}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {/* Team badge with color */}
                <span 
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border"
                  style={{ 
                    color: teamColor, 
                    borderColor: `${teamColor}30`,
                    backgroundColor: `${teamColor}10`,
                  }}
                >
                  {prop.team || 'NBA'}
                </span>
                {prop.position && (
                  <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">{prop.position}</span>
                )}
                <span className="text-[9px] font-bold text-muted-foreground/30 uppercase">{prop.sport}</span>
              </div>
            </div>
          </div>

          {/* Edge Badge */}
          <Badge 
            className="shrink-0 h-6 gap-1 font-black text-[9px] tracking-wider uppercase border-none px-2 shadow-lg"
            style={{ 
              backgroundColor: isPositiveEdge ? '#00ff8818' : '#ff444418', 
              color: isPositiveEdge ? '#00ff88' : '#ff4444',
              boxShadow: isPositiveEdge ? '0 0 12px rgba(0,255,136,0.1)' : '0 0 12px rgba(255,68,68,0.1)',
            }}
          >
            {isPositiveEdge ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(prop.edge).toFixed(1)}%
          </Badge>
        </div>

        {/* Prop Type Tag */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50">
            {formatLabel(prop.propType)}
          </span>
          {prop.source && (
            <span className="text-[9px] font-bold text-muted-foreground/30 bg-white/[0.03] px-1.5 py-0.5 rounded">
              {prop.source}
            </span>
          )}
          {prop.riskLevel && (
            <span 
              className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1"
              style={{ color: riskColor, backgroundColor: `${riskColor}10` }}
            >
              <Shield className="h-2.5 w-2.5" />
              {prop.riskLevel}
            </span>
          )}
        </div>

        {/* Line vs Projection Grid */}
        <div className="grid grid-cols-2 gap-[1px] rounded-xl bg-white/[0.04] overflow-hidden">
          <div className="bg-[#0c0d0e] p-3 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Line</p>
            <motion.span 
              className="text-2xl font-black tracking-tighter text-white block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {prop.line}
            </motion.span>
          </div>
          <div className="bg-[#0c0d0e] p-3 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-1">Projection</p>
            <motion.span 
              className="text-2xl font-black tracking-tighter text-primary block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ textShadow: '0 0 15px rgba(0,255,136,0.3)' }}
            >
              {typeof prop.projection === 'number' ? prop.projection.toFixed(1) : prop.projection}
              <Zap className="inline h-3.5 w-3.5 ml-1 fill-current animate-pulse" />
            </motion.span>
          </div>
        </div>

        {/* Confidence Ring + Probability */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Confidence Ring */}
            <div className="relative h-11 w-11">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" className="stroke-white/[0.06] fill-none" strokeWidth="2.5" />
                <motion.circle
                  cx="18" cy="18" r="15"
                  className="fill-none"
                  stroke={confidenceColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 100" }}
                  animate={{ strokeDasharray: `${prop.winProb} 100` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  style={{ filter: `drop-shadow(0 0 4px ${confidenceColor}60)` }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-black text-white">{prop.winProb}%</span>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Model Prob</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div 
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: confidenceColor, boxShadow: `0 0 6px ${confidenceColor}` }}
                />
                <span className="text-[10px] font-black uppercase" style={{ color: confidenceColor }}>
                  {prop.confidence}
                </span>
              </div>
            </div>
          </div>

          {/* Odds */}
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-[9px] font-mono font-bold text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">O {prop.overOdds}</span>
              <span className="text-[9px] font-mono font-bold text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded">U {prop.underOdds}</span>
            </div>
            {prop.marketImplied && (
              <p className="text-[9px] text-muted-foreground/30 font-bold">Mkt: {prop.marketImplied}%</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); onAnalytics?.(); }}
            className="h-9 flex-1 bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] text-[9px] font-black uppercase tracking-[0.12em] text-white/60 hover:text-white rounded-xl"
          >
            <ExternalLink className="h-3 w-3 mr-1.5" />
            Why This Edge?
          </Button>
          <Button 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); onAddBuilder?.(); }}
            className="h-9 flex-1 bg-primary/90 text-primary-foreground hover:bg-primary text-[9px] font-black uppercase tracking-[0.12em] gap-1 rounded-xl border-none"
            style={{ boxShadow: '0 0 20px rgba(0,255,136,0.2)' }}
          >
            <Target className="h-3.5 w-3.5" />
            Add to Builder
          </Button>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <p className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground/30 uppercase tracking-wider">
            <Clock className="h-2.5 w-2.5" />
            {prop.lastUpdated || 'Just now'}
          </p>
          {isPositiveEdge && prop.edge > 8 && (
            <div className="flex items-center gap-1 text-[8px] font-black text-amber-400 uppercase tracking-wider animate-pulse">
              <Zap className="h-2.5 w-2.5 fill-current" />
              Alpha Signal
            </div>
          )}
        </div>
      </div>

      {/* Bottom edge glow on hover */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${isPositiveEdge ? '#00ff88' : '#ff4466'}, transparent)` }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.8 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
