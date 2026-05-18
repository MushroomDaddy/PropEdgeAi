
import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedSportsBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#08090a]">
      {/* Dynamic Grid */}
      <div className="absolute inset-0 grid-bg opacity-30 mask-fade-bottom" />

      {/* Radial Stadium Glows */}
      <div 
        className="absolute -top-[10%] -left-[10%] h-[60%] w-[60%] rounded-full bg-indigo-500/10 blur-[120px]"
        style={{ animation: 'float 20s ease-in-out infinite' }}
      />
      <div 
        className="absolute top-[20%] -right-[10%] h-[40%] w-[40%] rounded-full bg-emerald-500/5 blur-[100px]"
        style={{ animation: 'float 25s ease-in-out infinite reverse' }}
      />
      <div 
        className="absolute -bottom-[10%] left-[20%] h-[50%] w-[50%] rounded-full bg-purple-500/5 blur-[120px]"
        style={{ animation: 'float 15s ease-in-out infinite' }}
      />

      {/* Moving Light Rays */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(94,106,210,0.05)_0%,transparent_50%)]"
      />
    </div>
  );
};

export const GridGlowBackground: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden">
      <svg className="absolute h-full w-full opacity-[0.03]">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

export const LivePulseOverlay: React.FC = () => (
  <div className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-overlay">
    <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#fff_2px,#fff_4px)] bg-[length:100%_4px]" />
  </div>
);
