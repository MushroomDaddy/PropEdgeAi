/**
 * OddsMovementChart — R13 Premium Visual
 *
 * Animated line chart showing odds/line movement over time.
 * Uses Recharts with premium styling.
 */

import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface DataPoint {
	time: string;
	line: number;
	label?: string;
}

interface Props {
	title?: string;
	data: DataPoint[];
	openingLine?: number;
	currentLine?: number;
	lineLabel?: string;
	height?: number;
}

function getTrend(data: DataPoint[]): "up" | "down" | "flat" {
	if (data.length < 2) return "flat";
	const first = data[0].line;
	const last = data[data.length - 1].line;
	if (last > first + 0.5) return "up";
	if (last < first - 0.5) return "down";
	return "flat";
}

export function OddsMovementChart({
	title,
	data,
	openingLine,
	currentLine,
	lineLabel = "Line",
	height = 180,
}: Props) {
	if (!data.length) return null;

	const trend = getTrend(data);
	const TrendIcon =
		trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
	const trendColor =
		trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#6B7280";
	const movement =
		data.length >= 2 ? data[data.length - 1].line - data[0].line : 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-[#0A0E17] rounded-2xl border border-white/10 overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
				<div>
					<h3 className="text-sm font-bold">{title || "Line Movement"}</h3>
					<div className="text-[10px] text-muted-foreground mt-0.5">
						{lineLabel} • {data.length} snapshots
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div
						className="flex items-center gap-1"
						style={{ color: trendColor }}
					>
						<TrendIcon className="size-4" />
						<span className="text-sm font-bold font-mono">
							{movement > 0 ? "+" : ""}
							{movement.toFixed(1)}
						</span>
					</div>
					{currentLine !== undefined && (
						<div className="px-2 py-0.5 bg-cyan-400/10 text-cyan-400 rounded-full text-[10px] font-bold font-mono">
							{currentLine}
						</div>
					)}
				</div>
			</div>

			{/* Chart */}
			<div className="px-2 py-2">
				<ResponsiveContainer width="100%" height={height}>
					<LineChart
						data={data}
						margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="rgba(255,255,255,0.03)"
						/>
						<XAxis
							dataKey="time"
							tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }}
							tickLine={false}
							axisLine={false}
							domain={["auto", "auto"]}
						/>
						<Tooltip
							contentStyle={{
								background: "#0D1117",
								border: "1px solid rgba(255,255,255,0.1)",
								borderRadius: "8px",
								fontSize: "11px",
							}}
							labelStyle={{ color: "rgba(255,255,255,0.5)" }}
							formatter={(value: number) => [`${value}`, lineLabel]}
						/>
						{openingLine !== undefined && (
							<ReferenceLine
								y={openingLine}
								stroke="rgba(255,255,255,0.15)"
								strokeDasharray="4 4"
								label={{
									value: `Open: ${openingLine}`,
									position: "right",
									fontSize: 9,
									fill: "rgba(255,255,255,0.3)",
								}}
							/>
						)}
						<Line
							type="monotone"
							dataKey="line"
							stroke="#00D4FF"
							strokeWidth={2}
							dot={false}
							activeDot={{
								r: 4,
								fill: "#00D4FF",
								stroke: "#0A0E17",
								strokeWidth: 2,
							}}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
}
