import {
	ArrowDownRight,
	ArrowUpRight,
	DollarSign,
	Flame,
	Minus,
	TrendingUp,
	Trophy,
	Wallet,
	PieChart as PieChartIcon,
	BarChart3,
	CreditCard,
	Activity,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Area,
	AreaChart,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBankroll, useBankrollSummary, useBankrollTransactions } from "../hooks/api/useBankroll";
import { AnimatedSportsBackground } from "@/components/shared/AnimatedBackground";
import { FadeIn, PageTransition } from "@/components/propedge/PageTransition";

const CHART_COLORS = ["#5e6ad2", "#00FF88", "#A855F7", "#00D4FF", "#FFB800"];

export function BankrollPage() {
	const [view, setView] = useState<"overview" | "platforms" | "transactions">("overview");
	const { data: summary } = useBankrollSummary();
	const { data: bankroll } = useBankroll();
	const { data: transactions } = useBankrollTransactions();

	const loading = summary === undefined;

	// Chart data
	const platformChartData = (bankroll || []).map((b: any) => ({
		name: b.platform?.replace("DraftKings ", "DK ") ?? "Unknown",
		balance: b.currentBalance ?? 0,
		roi: b.roi ?? 0,
		winRate: b.winRate ?? 0,
	}));

	const sportPnLData = summary?.sportPnL
		? Object.entries(summary.sportPnL).map(([name, value]) => ({
				name,
				value: value as number,
			}))
		: [];

	// Generate equity curve data from transactions
	const equityData = (() => {
		if (!transactions || transactions.length === 0) return [];
		let balance = summary?.totalBalance ?? 1000;
		return [...transactions].reverse().slice(-30).map((tx: any, i: number) => {
			balance += (tx.amount ?? 0);
			return { day: i + 1, balance: Math.round(balance) };
		});
	})();

	return (
		<PageTransition>
			<div className="relative min-h-screen pb-20">
				<AnimatedSportsBackground />

				<div className="container relative z-10 space-y-8 pt-6">
					{/* ═══ Premium Header ═══ */}
					<div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0c0d0e]/60 border border-white/10 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group">
						<div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent opacity-50" />
						<div className="relative flex items-center gap-6">
							<div className="relative">
								<div className="size-20 rounded-[1.5rem] bg-gradient-to-br from-purple-600 to-indigo-400 flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform duration-500">
									<Wallet className="size-10 text-white" />
								</div>
								<div className="absolute -bottom-1 -right-1 size-7 rounded-full bg-black border-2 border-emerald-400 flex items-center justify-center">
									<DollarSign className="size-4 text-emerald-400" />
								</div>
							</div>
							<div>
								<h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
									BANKROLL HQ
									<div className="bg-purple-500 px-3 py-1 rounded-full text-white font-black text-[10px] tracking-widest border-none shadow-[0_0_20px_rgba(168,85,247,0.3)] uppercase">TRACKER</div>
								</h1>
								<p className="text-sm font-bold text-muted-foreground/60 mt-1 uppercase tracking-widest flex items-center gap-2">
									<Activity className="size-4 text-purple-400" />
									Portfolio Intelligence • Cross-Platform Analytics
								</p>
							</div>
						</div>

						{/* Header Stats */}
						<div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
							<div className="text-right">
								<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Total Balance</p>
								<p className="text-2xl font-black text-white font-mono">${(summary?.currentBalance ?? summary?.totalBalance ?? 0).toLocaleString()}</p>
							</div>
							<div className="h-10 w-px bg-white/10 mx-2" />
							<div className="text-right">
								<p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Net P/L</p>
								<p className={cn(
									"text-2xl font-black font-mono",
									(summary?.netProfit ?? (summary?.totalWon ?? 0) - (summary?.totalLost ?? 0)) >= 0 ? "text-emerald-400" : "text-red-400"
								)}>
									{(summary?.netProfit ?? (summary?.totalWon ?? 0) - (summary?.totalLost ?? 0)) >= 0 ? "+" : ""}
									${Math.abs(summary?.netProfit ?? (summary?.totalWon ?? 0) - (summary?.totalLost ?? 0)).toLocaleString()}
								</p>
							</div>
						</div>
					</div>

					{/* ═══ Tab Selector ═══ */}
					<div className="flex items-center gap-2">
						{(["overview", "platforms", "transactions"] as const).map((v) => (
							<button
								key={v}
								onClick={() => setView(v)}
								className={cn(
									"relative px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border",
									view === v
										? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
										: "bg-white/[0.02] text-muted-foreground/50 border-white/5 hover:bg-white/[0.05] hover:text-white/80"
								)}
							>
								{v === "overview" && <PieChartIcon className="size-3.5 inline mr-1.5" />}
								{v === "platforms" && <CreditCard className="size-3.5 inline mr-1.5" />}
								{v === "transactions" && <BarChart3 className="size-3.5 inline mr-1.5" />}
								{v}
							</button>
						))}
					</div>

					{/* ═══ Holographic Stat Cards ═══ */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<FadeIn delay={0.1}>
							<HolographicCard
								label="Total Balance"
								value={`$${(summary?.currentBalance ?? summary?.totalBalance ?? 0).toLocaleString()}`}
								icon={<DollarSign className="size-6" />}
								color="emerald"
								trend={`$${(summary?.totalDeposited ?? 0).toLocaleString()} deposited`}
							/>
						</FadeIn>
						<FadeIn delay={0.2}>
							<HolographicCard
								label="Win Rate"
								value={`${(summary?.overallWinRate ?? summary?.winRate ?? 0).toFixed(1)}%`}
								icon={<Trophy className="size-6" />}
								color="amber"
								trend={`${summary?.wonEntries ?? 0} entries won`}
							/>
						</FadeIn>
						<FadeIn delay={0.3}>
							<HolographicCard
								label="Total Wagered"
								value={`$${(summary?.totalWagered ?? 0).toLocaleString()}`}
								icon={<Flame className="size-6" />}
								color="cyan"
								trend={`$${(summary?.totalWon ?? 0).toLocaleString()} won`}
							/>
						</FadeIn>
						<FadeIn delay={0.4}>
							<HolographicCard
								label="Overall ROI"
								value={`${(summary?.overallRoi ?? summary?.roi ?? 0) >= 0 ? "+" : ""}${(summary?.overallRoi ?? summary?.roi ?? 0).toFixed(1)}%`}
								icon={<TrendingUp className="size-6" />}
								color={(summary?.overallRoi ?? summary?.roi ?? 0) >= 0 ? "primary" : "red"}
								trend={(summary?.bestPlatform ?? (bankroll?.[0]?.platform)) ? `Best: ${summary?.bestPlatform ?? bankroll?.[0]?.platform}` : "No data yet"}
							/>
						</FadeIn>
					</div>

					{/* ═══ OVERVIEW TAB ═══ */}
					<AnimatePresence mode="wait">
						{view === "overview" && (
							<motion.div
								key="overview"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="grid lg:grid-cols-3 gap-6"
							>
								{/* Equity Curve */}
								<div className="lg:col-span-2 bg-[#0c0d0e]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
									<h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
										<Activity className="size-5 text-emerald-400" /> Portfolio Equity Curve
									</h3>
									<div className="h-[260px]">
										{equityData.length > 0 ? (
											<ResponsiveContainer width="100%" height="100%">
												<AreaChart data={equityData}>
													<defs>
														<linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
															<stop offset="5%" stopColor="#00FF88" stopOpacity={0.3} />
															<stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
													<XAxis dataKey="day" tick={{ fill: "#7B8BA8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} />
													<YAxis tick={{ fill: "#7B8BA8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} tickFormatter={(v) => `$${v}`} />
													<Tooltip
														contentStyle={{
															backgroundColor: "#0c0d0e",
															border: "1px solid rgba(255,255,255,0.1)",
															borderRadius: "16px",
															color: "#E8ECF4",
															fontSize: "12px",
														}}
														formatter={(v: number) => [`$${v}`, "Balance"]}
													/>
													<Area type="monotone" dataKey="balance" stroke="#00FF88" strokeWidth={2} fill="url(#equityGrad)" />
												</AreaChart>
											</ResponsiveContainer>
										) : (
											<div className="h-full flex items-center justify-center">
												<div className="text-center">
													<BarChart3 className="size-12 text-muted-foreground/10 mx-auto mb-3" />
													<p className="text-sm text-muted-foreground/40 font-bold uppercase tracking-wider">No transaction history yet</p>
												</div>
											</div>
										)}
									</div>
								</div>

								{/* Platform Balance Chart */}
								<div className="bg-[#0c0d0e]/60 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
									<h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
										<DollarSign className="size-5 text-primary" /> By Platform
									</h3>
									{platformChartData.length > 0 ? (
										<>
											<div className="h-[180px]">
												<ResponsiveContainer width="100%" height="100%">
													<BarChart data={platformChartData} barSize={20}>
														<CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
														<XAxis dataKey="name" tick={{ fill: "#7B8BA8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} />
														<YAxis tick={{ fill: "#7B8BA8", fontSize: 10 }} axisLine={{ stroke: "#1E293B" }} tickFormatter={(v) => `$${v}`} />
														<Tooltip
															contentStyle={{
																backgroundColor: "#0c0d0e",
																border: "1px solid rgba(255,255,255,0.1)",
																borderRadius: "16px",
																color: "#E8ECF4",
																fontSize: "12px",
															}}
															formatter={(v: number) => [`$${v}`, "Balance"]}
														/>
														<Bar dataKey="balance" radius={[6, 6, 0, 0]}>
															{platformChartData.map((_: any, i: number) => (
																<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
															))}
														</Bar>
													</BarChart>
												</ResponsiveContainer>
											</div>
											<div className="flex flex-wrap justify-center gap-3 mt-4">
												{platformChartData.map((p: any, i: number) => (
													<div key={p.name} className="flex items-center gap-1.5 text-xs">
														<div className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
														<span className="text-[#7B8BA8] text-[10px] uppercase tracking-wider font-bold">{p.name}</span>
													</div>
												))}
											</div>
										</>
									) : (
										<div className="h-[180px] flex items-center justify-center">
											<p className="text-sm text-muted-foreground/40 font-bold uppercase tracking-wider">No platforms yet</p>
										</div>
									)}
								</div>
							</motion.div>
						)}

						{/* ═══ PLATFORMS TAB ═══ */}
						{view === "platforms" && (
							<motion.div
								key="platforms"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
							>
								{(bankroll || []).length === 0 ? (
									<div className="col-span-full bg-[#0c0d0e]/60 border border-white/10 rounded-[2rem] p-12 text-center">
										<CreditCard className="size-16 text-muted-foreground/10 mx-auto mb-4" />
										<p className="text-lg font-black text-white uppercase tracking-tighter">No Platforms Connected</p>
										<p className="text-sm text-muted-foreground/40 mt-2">Add your first sportsbook platform to start tracking</p>
									</div>
								) : (
									(bankroll || []).map((b: any, i: number) => (
										<motion.div
											key={b.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: i * 0.1 }}
											whileHover={{ y: -5, scale: 1.02 }}
											className="bg-[#0c0d0e]/80 border border-white/10 rounded-[2rem] p-7 backdrop-blur-xl relative overflow-hidden"
										>
											<div className="absolute top-[-20px] right-[-20px] size-24 blur-3xl rounded-full opacity-10" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
											<div className="flex items-center justify-between mb-6">
												<h3 className="font-black text-white text-sm uppercase tracking-wider">{b.platform}</h3>
												<div className="size-3 rounded-full shadow-lg" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
											</div>

											<div className="text-3xl font-black font-mono text-white mb-1 tracking-tighter">${(b.currentBalance ?? 0).toLocaleString()}</div>
											<div className={cn("text-sm font-mono font-bold", (b.roi ?? 0) >= 0 ? "text-emerald-400" : "text-red-400")}>
												{(b.roi ?? 0) >= 0 ? "+" : ""}{(b.roi ?? 0).toFixed(1)}% ROI
											</div>

											<div className="grid grid-cols-2 gap-2 mt-6">
												<MiniStat label="Win Rate" value={`${(b.winRate ?? 0).toFixed(1)}%`} color="text-amber-400" />
												<MiniStat label="Entries" value={`${b.wonEntries ?? 0}/${b.totalEntries ?? 0}`} color="text-white" />
												<MiniStat label="Best Win" value={`+$${b.bestWin ?? 0}`} color="text-emerald-400" />
												<MiniStat label="Streak" value={
													(b.currentStreak ?? 0) > 0 ? `🔥 ${b.currentStreak}W` :
													(b.currentStreak ?? 0) < 0 ? `❄️ ${Math.abs(b.currentStreak)}L` : "—"
												} color={(b.currentStreak ?? 0) > 0 ? "text-emerald-400" : (b.currentStreak ?? 0) < 0 ? "text-red-400" : "text-white"} />
											</div>

											{/* ROI Progress */}
											<div className="mt-4">
												<div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${Math.min(100, Math.max(5, 50 + (b.roi ?? 0)))}%` }}
														transition={{ duration: 1 }}
														className="h-full rounded-full"
														style={{ backgroundColor: (b.roi ?? 0) >= 0 ? "#00FF88" : "#FF4466" }}
													/>
												</div>
											</div>
										</motion.div>
									))
								)}
							</motion.div>
						)}

						{/* ═══ TRANSACTIONS TAB ═══ */}
						{view === "transactions" && (
							<motion.div
								key="transactions"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="bg-[#0c0d0e]/60 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md"
							>
								<div className="p-6 border-b border-white/5">
									<h3 className="font-black text-white flex items-center gap-2 uppercase tracking-tighter">
										<DollarSign className="size-5 text-cyan-400" /> Recent Transactions
									</h3>
								</div>

								{(transactions || []).length === 0 ? (
									<div className="p-12 text-center">
										<DollarSign className="size-16 text-muted-foreground/10 mx-auto mb-4" />
										<p className="text-lg font-black text-white uppercase tracking-tighter">No Transactions Yet</p>
										<p className="text-sm text-muted-foreground/40 mt-2">Your bankroll activity will appear here</p>
									</div>
								) : (
									<div className="divide-y divide-white/[0.03]">
										{(transactions || []).map((tx: any, i: number) => (
											<motion.div
												key={tx.id ?? i}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: i * 0.03 }}
												className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors"
											>
												<div className={cn(
													"size-10 rounded-2xl flex items-center justify-center shrink-0",
													tx.type === "win" ? "bg-emerald-400/10" :
													tx.type === "loss" ? "bg-red-400/10" : "bg-cyan-400/10"
												)}>
													{tx.type === "win" ? <ArrowUpRight className="size-5 text-emerald-400" /> :
													 tx.type === "loss" ? <ArrowDownRight className="size-5 text-red-400" /> :
													 <Minus className="size-5 text-cyan-400" />}
												</div>
												<div className="flex-1 min-w-0">
													<div className="text-sm font-bold text-white">{tx.description}</div>
													<div className="text-xs text-muted-foreground/40 flex items-center gap-2 font-bold uppercase tracking-wider mt-0.5">
														<span>{tx.platform}</span>
														{tx.sport && <span>· {tx.sport}</span>}
														<span>· {new Date(tx.timestamp).toLocaleDateString()}</span>
													</div>
												</div>
												<div className={cn(
													"text-sm font-mono font-black shrink-0",
													(tx.amount ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
												)}>
													{(tx.amount ?? 0) >= 0 ? "+" : ""}${Math.abs(tx.amount ?? 0).toLocaleString()}
												</div>
												<Badge className={cn(
													"text-[9px] font-black tracking-widest uppercase shrink-0 border",
													tx.type === "win" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
													tx.type === "loss" ? "bg-red-400/10 text-red-400 border-red-400/20" :
													"bg-cyan-400/10 text-cyan-400 border-cyan-400/20"
												)}>
													{tx.type?.toUpperCase()}
												</Badge>
											</motion.div>
										))}
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</PageTransition>
	);
}

// ═══ Holographic Metric Card ═══

function HolographicCard({ label, value, icon, color, trend }: { label: string, value: string, icon: React.ReactNode, color: string, trend: string }) {
	const colorStyles: Record<string, string> = {
		emerald: "text-emerald-400 shadow-[0_0_30px_rgba(0,255,136,0.1)] border-emerald-500/20",
		amber: "text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.1)] border-amber-500/20",
		cyan: "text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.1)] border-cyan-500/20",
		primary: "text-primary shadow-[0_0_30px_rgba(94,106,210,0.1)] border-primary/20",
		red: "text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.1)] border-red-500/20",
		purple: "text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.1)] border-purple-500/20",
	};

	return (
		<motion.div
			whileHover={{ y: -5, scale: 1.02 }}
			className={cn("bg-[#0c0d0e]/80 border p-7 rounded-[2rem] backdrop-blur-xl relative overflow-hidden", colorStyles[color] ?? colorStyles.primary)}
		>
			<div className="absolute top-[-20px] right-[-20px] size-24 bg-current opacity-[0.03] blur-3xl rounded-full" />
			<div className="mb-4 bg-white/5 size-12 rounded-2xl flex items-center justify-center border border-white/5">
				{icon}
			</div>
			<p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1">{label}</p>
			<p className="text-3xl font-black text-white tracking-tighter mb-3">{value}</p>
			<div className="inline-flex items-center bg-white/5 px-2 py-0.5 rounded-full border border-white/5 text-[9px] font-black uppercase text-white/40 tracking-widest">
				{trend}
			</div>
		</motion.div>
	);
}

// ═══ Mini Stat Card ═══

function MiniStat({ label, value, color }: { label: string, value: string, color: string }) {
	return (
		<div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
			<div className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">{label}</div>
			<div className={cn("text-sm font-mono font-bold mt-0.5", color)}>{value}</div>
		</div>
	);
}
