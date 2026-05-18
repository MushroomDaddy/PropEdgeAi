
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════
   AnimatedSportsBackground
   - Stadium-light radial glows
   - Subtle animated grid
   - Moving light rays
   - Floating neon particles
   ═══════════════════════════════════════════ */
export const AnimatedSportsBackground: React.FC = () => {
  const particles = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      dur: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      color: ['#00ff88', '#5e6ad2', '#a855f7', '#00d4ff'][Math.floor(Math.random() * 4)],
    })), []);

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#08090a]">
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-bg opacity-20 mask-fade-bottom" />

      {/* Radial Stadium Glows */}
      <div 
        className="absolute -top-[15%] -left-[15%] h-[60%] w-[60%] rounded-full bg-indigo-500/[0.07] blur-[150px]"
        style={{ animation: 'float 20s ease-in-out infinite' }}
      />
      <div 
        className="absolute top-[15%] -right-[15%] h-[45%] w-[45%] rounded-full bg-emerald-500/[0.04] blur-[120px]"
        style={{ animation: 'float 25s ease-in-out infinite reverse' }}
      />
      <div 
        className="absolute -bottom-[15%] left-[15%] h-[50%] w-[50%] rounded-full bg-purple-500/[0.04] blur-[130px]"
        style={{ animation: 'float 18s ease-in-out infinite' }}
      />
      <div 
        className="absolute top-[40%] left-[40%] h-[30%] w-[30%] rounded-full bg-cyan-500/[0.03] blur-[100px]"
        style={{ animation: 'float 22s ease-in-out infinite reverse' }}
      />

      {/* Moving Light Ray */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,255,136,0.04)_0%,transparent_50%)]"
      />

      {/* Floating Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Scan Line (very subtle) */}
      <div className="absolute inset-0 opacity-[0.015] overflow-hidden pointer-events-none">
        <div 
          className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ animation: 'scan-line 8s linear infinite' }}
        />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   GridGlowBackground
   - Clean SVG grid with intersection glows
   ═══════════════════════════════════════════ */
export const GridGlowBackground: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden">
      <svg className="absolute h-full w-full opacity-[0.04]">
        <defs>
          <pattern id="grid-premium" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="grid-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-premium)" mask="url(#grid-mask)" />
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════
   LivePulseOverlay
   - CRT-style scanlines at very low opacity
   ═══════════════════════════════════════════ */
export const LivePulseOverlay: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay">
    <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] bg-[length:100%_4px]" />
  </div>
);

/* ═══════════════════════════════════════════
   MovingGradientBorder
   - Animated rotating gradient border wrapper
   ═══════════════════════════════════════════ */
export const MovingGradientBorder: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`relative ${className || ''}`}>
    <div className="gradient-border rounded-2xl">
      {children}
    </div>
  </div>
);
