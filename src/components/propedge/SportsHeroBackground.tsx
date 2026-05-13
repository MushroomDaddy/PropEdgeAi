/**
 * SportsHeroBackground — R13 Premium Visual
 *
 * Animated gradient mesh background with sport-themed particle effects.
 * Used behind hero sections on Dashboard and Player Intel.
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Props {
  sport?: string;
  intensity?: "low" | "medium" | "high";
  children?: React.ReactNode;
  className?: string;
}

const SPORT_GRADIENTS: Record<string, string[]> = {
  NBA: ["#FF6B00", "#FF8C38", "#1D428A"],
  NFL: ["#013369", "#D50A0A", "#1B48A0"],
  MLB: ["#002D62", "#E31937", "#BF0D3E"],
  NHL: ["#000000", "#00529B", "#A2AAAD"],
  default: ["#00D4FF", "#7C3AED", "#06B6D4"],
};

export function SportsHeroBackground({ sport, intensity = "medium", children, className = "" }: Props) {
  const colors = SPORT_GRADIENTS[sport?.toUpperCase() || ""] || SPORT_GRADIENTS.default;
  const particleCount = intensity === "high" ? 12 : intensity === "medium" ? 8 : 4;

  const particles = useMemo(() =>
    Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    })),
    [particleCount]
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, ${colors[0]}33 0%, transparent 60%),
                         radial-gradient(ellipse at 80% 20%, ${colors[1]}25 0%, transparent 50%),
                         radial-gradient(ellipse at 50% 80%, ${colors[2]}20 0%, transparent 60%)`,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Animated orb */}
        <motion.div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{ background: colors[0] }}
          animate={{
            x: ["-10%", "60%", "30%", "-10%"],
            y: ["20%", "60%", "10%", "20%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating particles */}
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: colors[p.id % colors.length],
              opacity: 0.4,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
