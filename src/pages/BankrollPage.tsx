import { useQuery } from "convex/react";
import {
	ArrowDownRight,
	ArrowUpRight,
	DollarSign,
	Flame,
	Minus,
	TrendingDown,
	TrendingUp,
	Trophy,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { api } from "../../convex/_generated/api";

const CHART_COLORS = ["#00FF88", "#00D4FF", "#A855F7", "#FF4466", "#FFB800"];

export function BankrollPage() {
	const [view, setView] = useState<"overview" | "platforms" | "transactions">(
		"overview",
	);
	const summary = useQuery(api.bankroll.bankrollSummary);
	const bankroll = useQuery(api.bankroll.myBankroll);
	const transactions = useQuery(api.bankroll.myTransactions);

	if (!summary) {
		return (
			<div className="space-y-6 max-w-[1200px]">
				<div className="flex items-center gap-2">
					<Wallet className="size-6 text-[#A855F7]" />
					<h1 className="text-2xl font-bold text-white">Bankroll Tracker</h1>
				</div>
				<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-8 text-center">
					<Wallet className="size-12 text-muted-foreground/20 mx-auto mb-3" />
					<p className="text-sm text-muted-foreground">
						Loading bankroll data...
					</p>
				</div>
			</div>
		);
	}

	// Chart data
	const platformChartData = (bankroll || []).map((b: any) => ({
		name: b.platform.replace("DraftKings ", "DK "),
		balance: b.currentBalance,
		roi: b.roi,
		winRate: b.winRate,
	}));

	const sportPnLData = summary.sportPnL
		? Object.entries(summary.sportPnL).map(([name, value]) => ({
				name,
				value: value as number,
			}))
		: [];

	return (
		<div className="space-y-6 max-w-[1200px]">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
				<div>
					<h1 className="text-2xl font-bold text-white flex items-center gap-2">
						<Wallet className="size-6 text-[#A855F7]" />
						Bankroll Tracker
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Track ROI, P/L, and performance across all platforms
					</p>
				</div>
				<div className="flex items-center gap-1 p-0.5 bg-[#111827] rounded-lg border border-[#1E293B]">
					{(["overview", "platforms", "transactions"] as const).map((v) => (
						<button
							type="button"
							key={v}
							onClick={() => setView(v)}
							className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
								view === v
									? "bg-[#A855F7]/15 text-[#A855F7]"
									: "text-[#7B8BA8] hover:text-white"
							}`}
						>
							{v}
						</button>
					))}
				</div>
			</div>

			{/* Top Stats */}
			<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
				<BankStatCard
					label="Total Balance"
					value={`$${summary.totalBalance.toLocaleString()}`}
					icon={<DollarSign className="size-4" />}
					color="#00FF88"
					subValue={`$${summary.totalDeposited.toLocaleString()} deposited`}
				/>
				<BankStatCard
					label="Net Profit"
					value={`${summary.netProfit >= 0 ? "+" : ""}$${summary.netProfit.toLocaleString()}`}
					icon={
						summary.netProfit >= 0 ? (
							<TrendingUp className="size-4" />
						) : (
							<TrendingDown className="size-4" />
						)
					}
					color={summary.netProfit >= 0 ? "#00FF88" : "#FF4466"}
					subValue={`ROI: ${summary.overallRoi}%`}
				/>
				<BankStatCard
					label="Win Rate"
					value={`${summary.overallWinRate}%`}
					icon={<Trophy className="size-4" />}
					color="#FFB800"
					subValue={`${summary.wonEntries}/${summary.totalEntries} entries`}
				/>
				<BankStatCard
					label="Total Wagered"
					value={`$${summary.totalWagered.toLocaleString()}`}
					icon={<Flame className="size-4" />}
					color="#00D4FF"
					subValue={`$${summary.totalWon.toLocaleString()} won`}
				/>
				<BankStatCard
					label="Best Platform"
					value={summary.bestPlatform}
					icon={<ArrowUpRight className="size-4" />}
					color="#A855F7"
					subValue={`${summary.bestPlatformRoi}% ROI`}
				/>
			</div>

			{view === "overview" && (
				<div className="grid lg:grid-cols-2 gap-5">
					{/* Platform Balance Chart */}
					<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
						<h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
							<DollarSign className="size-4 text-[#00FF88]" /> Balance by
							Platform
						</h3>
						<div className="h-[220px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={platformChartData} barSize={24}>
									<CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
									<XAxis
										dataKey="name"
										tick={{ fill: "#7B8BA8", fontSize: 11 }}
										axisLine={{ stroke: "#1E293B" }}
									/>
									<YAxis
										tick={{ fill: "#7B8BA8", fontSize: 11 }}
										axisLine={{ stroke: "#1E293B" }}
										tickFormatter={(v) => `$${v}`}
									/>
									<Tooltip
										contentStyle={{
											backgroundColor: "#111827",
											border: "1px solid #1E293B",
											borderRadius: "8px",
											color: "#E8ECF4",
											fontSize: "12px",
										}}
										formatter={(v: number) => [`$${v}`, "Balance"]}
									/>
									<Bar dataKey="balance" radius={[4, 4, 0, 0]}>
										{platformChartData.map((_: any, i: number) => (
											<Cell
												key={i}
												fill={CHART_COLORS[i % CHART_COLORS.length]}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* P/L by Sport Pie */}
					<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
						<h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
							<Trophy className="size-4 text-[#FFB800]" /> P/L by Sport
						</h3>
						<div className="h-[180px] flex items-center justify-center">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={sportPnLData.filter((d) => d.value > 0)}
										cx="50%"
										cy="50%"
										innerRadius={45}
										outerRadius={70}
										paddingAngle={3}
										dataKey="value"
									>
										{sportPnLData
											.filter((d) => d.value > 0)
											.map((_, i) => (
												<Cell
													key={i}
													fill={CHART_COLORS[i % CHART_COLORS.length]}
												/>
											))}
									</Pie>
									<Tooltip
										contentStyle={{
											backgroundColor: "#111827",
											border: "1px solid #1E293B",
											borderRadius: "8px",
											color: "#E8ECF4",
											fontSize: "12px",
										}}
										formatter={(v: number) => [`$${v}`, "Profit"]}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="flex flex-wrap justify-center gap-4 mt-2">
							{sportPnLData.map((s, i) => (
								<div key={s.name} className="flex items-center gap-1.5 text-xs">
									<div
										className="size-2 rounded-full"
										style={{
											backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
										}}
									/>
									<span className="text-[#7B8BA8]">{s.name}</span>
									<span
										className={`font-mono font-bold ${s.value >= 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}
									>
										{s.value >= 0 ? "+" : ""}${s.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{view === "platforms" && (
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{(bankroll || []).map((b: any, i: number) => (
						<div
							key={b._id}
							className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 hover:border-[#A855F7]/30 transition-colors"
						>
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-white text-sm">
									{b.platform}
								</h3>
								<div
									className="size-3 rounded-full"
									style={{
										backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
									}}
								/>
							</div>

							<div className="text-2xl font-bold font-mono text-white mb-1">
								${b.currentBalance.toLocaleString()}
							</div>
							<div
								className={`text-sm font-mono font-bold ${b.roi >= 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}
							>
								{b.roi >= 0 ? "+" : ""}
								{b.roi}% ROI
							</div>

							<div className="grid grid-cols-2 gap-2 mt-4">
								<div className="bg-[#0A0E17] rounded-lg p-2">
									<div className="text-[10px] text-muted-foreground">
										Win Rate
									</div>
									<div className="text-sm font-mono font-bold text-[#FFB800]">
										{b.winRate}%
									</div>
								</div>
								<div className="bg-[#0A0E17] rounded-lg p-2">
									<div className="text-[10px] text-muted-foreground">
										Entries
									</div>
									<div className="text-sm font-mono text-white">
										{b.wonEntries}/{b.totalEntries}
									</div>
								</div>
								<div className="bg-[#0A0E17] rounded-lg p-2">
									<div className="text-[10px] text-muted-foreground">
										Best Win
									</div>
									<div className="text-sm font-mono text-[#00FF88]">
										+${b.bestWin}
									</div>
								</div>
								<div className="bg-[#0A0E17] rounded-lg p-2">
									<div className="text-[10px] text-muted-foreground">
										Streak
									</div>
									<div
										className={`text-sm font-mono font-bold ${b.currentStreak > 0 ? "text-[#00FF88]" : b.currentStreak < 0 ? "text-[#FF4466]" : "text-white"}`}
									>
										{b.currentStreak > 0
											? `🔥 ${b.currentStreak}W`
											: b.currentStreak < 0
												? `❄️ ${Math.abs(b.currentStreak)}L`
												: "—"}
									</div>
								</div>
							</div>

							{/* Mini ROI bar */}
							<div className="mt-3">
								<div className="w-full h-1.5 bg-[#1E293B] rounded-full overflow-hidden">
									<div
										className="h-full rounded-full"
										style={{
											width: `${Math.min(100, Math.max(5, 50 + b.roi))}%`,
											backgroundColor: b.roi >= 0 ? "#00FF88" : "#FF4466",
										}}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{view === "transactions" && (
				<div className="bg-[#111827] rounded-xl border border-[#1E293B] overflow-hidden">
					<div className="p-4 border-b border-[#1E293B]">
						<h3 className="font-semibold text-white flex items-center gap-2">
							<DollarSign className="size-4 text-[#00D4FF]" /> Recent
							Transactions
						</h3>
					</div>
					<div className="divide-y divide-[#1E293B]/50">
						{(transactions || []).map((tx: any) => (
							<div
								key={tx._id}
								className="flex items-center gap-3 p-4 hover:bg-[#1A2236]/30 transition-colors"
							>
								<div
									className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
										tx.type === "win"
											? "bg-[#00FF88]/10"
											: tx.type === "loss"
												? "bg-[#FF4466]/10"
												: "bg-[#00D4FF]/10"
									}`}
								>
									{tx.type === "win" ? (
										<ArrowUpRight className="size-4 text-[#00FF88]" />
									) : tx.type === "loss" ? (
										<ArrowDownRight className="size-4 text-[#FF4466]" />
									) : (
										<Minus className="size-4 text-[#00D4FF]" />
									)}
								</div>
								<div className="flex-1 min-w-0">
									<div className="text-sm font-medium text-white">
										{tx.description}
									</div>
									<div className="text-xs text-muted-foreground flex items-center gap-2">
										<span>{tx.platform}</span>
										{tx.sport && <span>· {tx.sport}</span>}
										<span>· {new Date(tx.timestamp).toLocaleDateString()}</span>
									</div>
								</div>
								<div
									className={`text-sm font-mono font-bold shrink-0 ${
										tx.amount >= 0 ? "text-[#00FF88]" : "text-[#FF4466]"
									}`}
								>
									{tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount)}
								</div>
								<Badge
									className={`text-[10px] shrink-0 ${
										tx.type === "win"
											? "bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/20"
											: tx.type === "loss"
												? "bg-[#FF4466]/15 text-[#FF4466] border-[#FF4466]/20"
												: "bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/20"
									}`}
								>
									{tx.type.toUpperCase()}
								</Badge>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

function BankStatCard({
	label,
	value,
	icon,
	color,
	subValue,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	color: string;
	subValue: string;
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
			<div className="text-xs text-muted-foreground mt-0.5">{subValue}</div>
		</div>
	);
}
