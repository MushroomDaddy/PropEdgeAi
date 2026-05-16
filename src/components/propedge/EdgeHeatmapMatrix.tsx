/**
 * EdgeHeatmapMatrix — R13 Premium Visual
 *
 * Visual heatmap grid showing edge values across props/markets.
 * Green = positive edge, red = negative, intensity = magnitude.
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface HeatmapCell {
  label: string;
  value: number; // edge % (positive or negative)
  subLabel?: string;
}

interface Props {
  title?: string;
  rows: { label: string; cells: HeatmapCell[] }[];
  columnHeaders?: string[];
  onCellClick?: (cell: HeatmapCell, rowIndex: number, colIndex: number) => void;
}

function getCellColor(value: number): string {
  if (value >= 8) return "bg-emerald-500/60 text-white";
  if (value >= 4) return "bg-emerald-500/30 text-emerald-300";
  if (value >= 1) return "bg-emerald-500/15 text-emerald-400";
  if (value > -1) return "bg-white/5 text-muted-foreground";
  if (value > -4) return "bg-red-500/15 text-red-400";
  if (value > -8) return "bg-red-500/30 text-red-300";
  return "bg-red-500/60 text-white";
}

export function EdgeHeatmapMatrix({
  title,
  rows,
  columnHeaders,
  onCellClick,
}: Props) {
  if (!rows.length) return null;

  return (
    <div className="bg-[#0A0E17] rounded-2xl border border-white/10 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-white/5">
          <h3 className="text-sm font-bold">{title}</h3>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Column headers */}
          {columnHeaders && (
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-[10px] text-muted-foreground font-medium w-28" />
                {columnHeaders.map((h, i) => (
                  <th
                    key={i}
                    className="px-1 py-2 text-center text-[10px] text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-t border-white/5">
                <td className="px-3 py-2 text-[11px] font-medium truncate max-w-[120px]">
                  {row.label}
                </td>
                {row.cells.map((cell, ci) => (
                  <td key={ci} className="px-1 py-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onCellClick?.(cell, ri, ci)}
                      className={`w-full rounded-lg px-2 py-2 text-center transition-colors ${getCellColor(cell.value)}`}
                    >
                      <div className="text-xs font-mono font-bold">
                        {cell.value > 0 ? "+" : ""}
                        {cell.value.toFixed(1)}
                      </div>
                      {cell.subLabel && (
                        <div className="text-[8px] opacity-60 mt-0.5">
                          {cell.subLabel}
                        </div>
                      )}
                    </motion.button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-white/5">
        <span className="text-[9px] text-muted-foreground">Edge:</span>
        {[
          { label: "Strong +", color: "bg-emerald-500/60" },
          { label: "Mild +", color: "bg-emerald-500/15" },
          { label: "Neutral", color: "bg-white/5" },
          { label: "Mild −", color: "bg-red-500/15" },
          { label: "Strong −", color: "bg-red-500/60" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`size-2 rounded-sm ${l.color}`} />
            <span className="text-[8px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
