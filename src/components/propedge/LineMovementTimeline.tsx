import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Snapshot {
	timestamp: number;
	line: number;
	snapshotType: string;
	edge?: number;
	projection?: number;
}

export function LineMovementTimeline({ snapshots }: { snapshots: Snapshot[] }) {
	if (!snapshots || snapshots.length === 0) return null;

	const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);
	const minLine = Math.min(...sorted.map((s) => s.line));
	const maxLine = Math.max(...sorted.map((s) => s.line));
	const range = maxLine - minLine || 1;

	// Direction from open to current
	const firstLine = sorted[0].line;
	const lastLine = sorted[sorted.length - 1].line;
	const diff = lastLine - firstLine;
	const TrendIcon =
		diff > 0.1 ? TrendingUp : diff < -0.1 ? TrendingDown : Minus;
	const trendColor =
		diff > 0.1
			? "text-emerald-400"
			: diff < -0.1
				? "text-red-400"
				: "text-zinc-400";

	return (
		<div className="rounded-xl border border-white/5 bg-card/50 p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-semibold flex items-center gap-2">
					<span className="size-2 rounded-full bg-purple-400" />
					Line Movement
				</h3>
				<span
					className={cn(
						"flex items-center gap-1 text-xs font-mono font-semibold",
						trendColor,
					)}
				>
					<TrendIcon className="size-3" />
					{diff > 0 ? "+" : ""}
					{diff.toFixed(1)}
				</span>
			</div>

			{/* Visual timeline */}
			<div className="relative h-16 mb-4">
				{/* Line chart */}
				<svg
					aria-hidden="true"
					className="w-full h-full"
					viewBox={`0 0 ${sorted.length * 100} 60`}
					preserveAspectRatio="none"
				>
					{/* Grid lines */}
					<line
						x1="0"
						y1="15"
						x2={sorted.length * 100}
						y2="15"
						stroke="rgba(255,255,255,0.05)"
						strokeDasharray="4,4"
					/>
					<line
						x1="0"
						y1="30"
						x2={sorted.length * 100}
						y2="30"
						stroke="rgba(255,255,255,0.05)"
						strokeDasharray="4,4"
					/>
					<line
						x1="0"
						y1="45"
						x2={sorted.length * 100}
						y2="45"
						stroke="rgba(255,255,255,0.05)"
						strokeDasharray="4,4"
					/>

					{/* Line */}
					<polyline
						fill="none"
						stroke="url(#lineGradient)"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						points={sorted
							.map((s, i) => {
								const x = i * 100 + 50;
								const y = 55 - ((s.line - minLine) / range) * 50;
								return `${x},${y}`;
							})
							.join(" ")}
					/>

					{/* Dots */}
					{sorted.map((s, i) => {
						const x = i * 100 + 50;
						const y = 55 - ((s.line - minLine) / range) * 50;
						return (
							<circle
								key={i}
								cx={x}
								cy={y}
								r="4"
								fill={
									s.snapshotType === "opening"
										? "#a78bfa"
										: s.snapshotType === "closing"
											? "#f97316"
											: "#00FF88"
								}
								stroke="rgba(0,0,0,0.3)"
								strokeWidth="1"
							/>
						);
					})}

					<defs>
						<linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#a78bfa" />
							<stop offset="100%" stopColor="#00FF88" />
						</linearGradient>
					</defs>
				</svg>
			</div>

			{/* Snapshot labels */}
			<div className="space-y-1.5">
				{sorted.map((s, i) => (
					<div key={i} className="flex items-center justify-between text-xs">
						<div className="flex items-center gap-2">
							<span
								className={cn(
									"size-2 rounded-full shrink-0",
									s.snapshotType === "opening"
										? "bg-purple-400"
										: s.snapshotType === "closing"
											? "bg-orange-400"
											: "bg-emerald-400",
								)}
							/>
							<span className="text-muted-foreground/70 capitalize">
								{s.snapshotType}
							</span>
							<span className="text-muted-foreground/40 text-[10px]">
								{new Date(s.timestamp).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
								})}
							</span>
						</div>
						<div className="flex items-center gap-3">
							<span className="font-mono font-semibold">
								{s.line.toFixed(1)}
							</span>
							{s.edge !== undefined && (
								<span
									className={cn(
										"font-mono text-[10px]",
										s.edge > 0 ? "text-emerald-400" : "text-red-400",
									)}
								>
									{s.edge > 0 ? "+" : ""}
									{s.edge.toFixed(1)}%
								</span>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
