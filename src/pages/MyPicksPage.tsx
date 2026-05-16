import { useQuery } from "convex/react";
import {
	BarChart3,
	Calendar,
	CheckCircle2,
	Clock,
	Target,
	TrendingUp,
	Trophy,
	XCircle,
} from "lucide-react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";

// Mock performance data for chart
const performanceData = [
	{ day: "Mon", picks: 8, wins: 5 },
	{ day: "Tue", picks: 12, wins: 8 },
	{ day: "Wed", picks: 6, wins: 4 },
	{ day: "Thu", picks: 10, wins: 7 },
	{ day: "Fri", picks: 15, wins: 11 },
	{ day: "Sat", picks: 20, wins: 14 },
	{ day: "Sun", picks: 18, wins: 12 },
];

export function MyPicksPage() {
	const allPicks = useQuery(api.picks.myPicks, {});
	const pickStats = useQuery(api.picks.pickStats);
	const entries = useQuery(api.picks.myEntries);

	return (
		<div className="space-y-6 max-w-[1200px]">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-white flex items-center gap-2">
					<Target className="size-6 text-[#FFB800]" />
					My Picks & Tracker
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Track your performance across all platforms
				</p>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
				<PickStatCard
					label="Total Picks"
					value={pickStats?.totalPicks?.toString() || "0"}
					icon={<BarChart3 className="size-4" />}
					color="#00D4FF"
				/>
				<PickStatCard
					label="Pending"
					value={pickStats?.pendingPicks?.toString() || "0"}
					icon={<Clock className="size-4" />}
					color="#FFB800"
				/>
				<PickStatCard
					label="Won"
					value={pickStats?.wonPicks?.toString() || "0"}
					icon={<CheckCircle2 className="size-4" />}
					color="#00FF88"
				/>
				<PickStatCard
					label="Lost"
					value={pickStats?.lostPicks?.toString() || "0"}
					icon={<XCircle className="size-4" />}
					color="#FF4466"
				/>
				<PickStatCard
					label="Win Rate"
					value={pickStats?.winRate ? `${pickStats.winRate}%` : "—"}
					icon={<Trophy className="size-4" />}
					color="#A855F7"
				/>
			</div>

			{/* Performance Chart */}
			<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
				<h3 className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
					<TrendingUp className="size-4 text-[#00FF88]" />
					Weekly Performance (Demo)
				</h3>
				<div className="h-[200px]">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={performanceData}>
							<defs>
								<linearGradient id="colorPicks" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
								</linearGradient>
								<linearGradient id="colorWins" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
							<XAxis
								dataKey="day"
								tick={{ fill: "#7B8BA8", fontSize: 12 }}
								axisLine={{ stroke: "#1E293B" }}
							/>
							<YAxis
								tick={{ fill: "#7B8BA8", fontSize: 12 }}
								axisLine={{ stroke: "#1E293B" }}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#111827",
									border: "1px solid #1E293B",
									borderRadius: "8px",
									color: "#E8ECF4",
									fontSize: "12px",
								}}
							/>
							<Area
								type="monotone"
								dataKey="picks"
								stroke="#00D4FF"
								fill="url(#colorPicks)"
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="wins"
								stroke="#00FF88"
								fill="url(#colorWins)"
								strokeWidth={2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
				<div className="flex items-center justify-center gap-6 mt-3">
					<div className="flex items-center gap-1.5 text-xs">
						<div className="w-3 h-0.5 bg-[#00D4FF] rounded" />
						<span className="text-muted-foreground">Total Picks</span>
					</div>
					<div className="flex items-center gap-1.5 text-xs">
						<div className="w-3 h-0.5 bg-[#00FF88] rounded" />
						<span className="text-muted-foreground">Wins</span>
					</div>
				</div>
			</div>

			{/* Entries List */}
			{entries && entries.length > 0 && (
				<div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
					<div className="p-4 border-b border-[#1E293B]">
						<h3 className="font-semibold text-white flex items-center gap-2">
							<Calendar className="size-4 text-[#A855F7]" />
							Recent Entries
						</h3>
					</div>
					<div className="divide-y divide-[#1E293B]/50">
						{entries.map((entry: any) => (
							<div
								key={entry._id}
								className="flex items-center justify-between p-4"
							>
								<div>
									<div className="text-sm font-medium text-white">
										{entry.platform} · {entry.entryType}
									</div>
									<div className="text-xs text-muted-foreground">
										{entry.pickIds.length} picks · ${entry.stake} stake
									</div>
								</div>
								<Badge
									className={`text-xs ${
										entry.status === "active"
											? "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/20"
											: entry.status === "won"
												? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
												: "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
									}`}
								>
									{entry.status.toUpperCase()}
								</Badge>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Picks History */}
			<div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
				<div className="p-4 border-b border-[#1E293B]">
					<h3 className="font-semibold text-white flex items-center gap-2">
						<Target className="size-4 text-[#00D4FF]" />
						Pick History
					</h3>
				</div>
				{!allPicks || allPicks.length === 0 ? (
					<div className="p-8 text-center">
						<Target className="size-10 text-muted-foreground/30 mx-auto mb-3" />
						<p className="text-sm text-muted-foreground">No picks yet</p>
						<p className="text-xs text-muted-foreground/60 mt-1">
							Add picks from the Prop Analyzer to start tracking
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-[#1E293B] text-[#7B8BA8]">
									<th className="text-left p-3 font-medium">Player</th>
									<th className="text-left p-3 font-medium">Prop</th>
									<th className="text-right p-3 font-medium">Line</th>
									<th className="text-center p-3 font-medium">Pick</th>
									<th className="text-right p-3 font-medium">Edge</th>
									<th className="text-left p-3 font-medium">Platform</th>
									<th className="text-center p-3 font-medium">Status</th>
								</tr>
							</thead>
							<tbody>
								{allPicks.map((pick: any) => (
									<tr
										key={pick._id}
										className="border-b border-[#1E293B]/50 hover:bg-[#1A2236]/30"
									>
										<td className="p-3">
											<div className="font-medium text-white">
												{pick.playerName}
											</div>
											<div className="text-xs text-muted-foreground">
												{pick.sport}
											</div>
										</td>
										<td className="p-3 text-[#C8D0E0]">{pick.statType}</td>
										<td className="p-3 text-right font-mono">{pick.line}</td>
										<td className="p-3 text-center">
											<Badge
												className={`text-[10px] font-bold ${
													pick.overUnder === "over"
														? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
														: "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
												}`}
											>
												{pick.overUnder?.toUpperCase()}
											</Badge>
										</td>
										<td className="p-3 text-right">
											<span
												className={`font-mono font-bold ${
													(pick.edge || 0) > 0
														? "text-[#00FF88]"
														: "text-[#FF4466]"
												}`}
											>
												{(pick.edge || 0) > 0 ? "+" : ""}
												{pick.edge || 0}%
											</span>
										</td>
										<td className="p-3">
											<span className="text-xs text-muted-foreground bg-[#1A2236] px-2 py-0.5 rounded">
												{pick.platform}
											</span>
										</td>
										<td className="p-3 text-center">
											<StatusBadge status={pick.status} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

function PickStatCard({
	label,
	value,
	icon,
	color,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	color: string;
}) {
	return (
		<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-4">
			<div className="flex items-center justify-between mb-2">
				<span className="text-xs text-muted-foreground">{label}</span>
				<div
					className="size-7 rounded-lg flex items-center justify-center"
					style={{ backgroundColor: `${color}15`, color }}
				>
					{icon}
				</div>
			</div>
			<div className="text-xl font-bold text-white font-mono">{value}</div>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		pending: "bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/20",
		won: "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20",
		lost: "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20",
		push: "bg-[#7B8BA8]/15 text-[#7B8BA8] border-[#7B8BA8]/20",
	};
	return (
		<Badge
			className={`text-[10px] font-bold ${styles[status] || styles.pending}`}
		>
			{status.toUpperCase()}
		</Badge>
	);
}
