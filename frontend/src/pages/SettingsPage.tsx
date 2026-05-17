import { useMutation, useQuery } from "convex/react";
import {
	Bell,
	DollarSign,
	Eye,
	EyeOff,
	Palette,
	Save,
	Sliders,
	User,
	Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";

const CHART_COLORS = ["#00FF88", "#00D4FF", "#A855F7", "#FF4466", "#FFB800"];

const PLATFORMS_DEFAULT = [
	{ name: "PrizePicks", balance: 250 },
	{ name: "Underdog", balance: 180 },
	{ name: "Sleeper", balance: 120 },
	{ name: "DraftKings Pick6", balance: 300 },
	{ name: "Kalshi", balance: 450 },
];

const PL_BY_SPORT = [
	{ name: "NBA", value: 320, pnl: 320 },
	{ name: "NFL", value: 180, pnl: 180 },
	{ name: "MLB", value: -60, pnl: -60 },
	{ name: "NHL", value: 45, pnl: 45 },
];

export function SettingsPage() {
	const settings = useQuery(api.settings.get, {});
	const updateSettings = useMutation(api.settings.save);

	const [edgeSens, setEdgeSens] = useState(5);
	const [minConf, setMinConf] = useState(55);
	const [showKalshi, setShowKalshi] = useState(true);
	const [darkMode, setDarkMode] = useState(true);
	const [favSports, setFavSports] = useState(["NBA", "NFL", "MLB", "NHL"]);
	const [favPlatforms, setFavPlatforms] = useState([
		"PrizePicks",
		"Underdog",
		"Kalshi",
	]);
	const [alertHigh, setAlertHigh] = useState(true);
	const [alertStreak, setAlertStreak] = useState(true);
	const [defaultBankroll, setDefaultBankroll] = useState(1000);
	const [showBalances, setShowBalances] = useState(true);

	useEffect(() => {
		if (settings) {
			setDarkMode(settings.darkMode ?? true);
			setFavSports(settings.favoriteSports ?? ["NBA", "NFL", "MLB", "NHL"]);
			setFavPlatforms(
				settings.favoritePlatforms ?? ["PrizePicks", "Underdog", "Kalshi"],
			);
			setDefaultBankroll(settings.defaultBankroll ?? 1000);
		}
	}, [settings]);

	const handleSave = async () => {
		try {
			await updateSettings({
				darkMode,
				notifications: alertHigh,
				riskTolerance:
					edgeSens <= 3
						? "conservative"
						: edgeSens <= 8
							? "moderate"
							: "aggressive",
				favoriteSports: favSports,
				favoritePlatforms: favPlatforms,
				defaultBankroll: defaultBankroll,
			});
			toast.success("Settings saved! ✅");
		} catch {
			toast.error("Failed to save settings");
		}
	};

	const toggleSport = (sport: string) => {
		setFavSports((prev) =>
			prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
		);
	};

	const togglePlatform = (platform: string) => {
		setFavPlatforms((prev) =>
			prev.includes(platform)
				? prev.filter((p) => p !== platform)
				: [...prev, platform],
		);
	};

	const totalBalance = PLATFORMS_DEFAULT.reduce((s, p) => s + p.balance, 0);
	const totalPnL = PL_BY_SPORT.reduce((s, p) => s + p.pnl, 0);

	return (
		<div className="space-y-6 max-w-[1200px]">
			<div>
				<h1 className="text-2xl font-bold text-white flex items-center gap-2">
					<Sliders className="size-6 text-[#A855F7]" /> Settings
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Configure your PropEdge AI experience and track your bankroll
				</p>
			</div>

			{/* Bankroll Tracker */}
			<div className="bg-gradient-to-br from-[#A855F7]/5 via-[#0A0E17] to-[#00FF88]/5 rounded-xl border border-[#A855F7]/20 p-5">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<div className="size-9 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#00FF88] flex items-center justify-center">
							<Wallet className="size-5 text-white" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-white">Bankroll Tracker</h2>
							<p className="text-xs text-muted-foreground">
								Track balances and P/L across platforms
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setShowBalances(!showBalances)}
						className="text-muted-foreground hover:text-white transition-colors"
					>
						{showBalances ? (
							<Eye className="size-4" />
						) : (
							<EyeOff className="size-4" />
						)}
					</button>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
					<div className="bg-[#111827] rounded-lg border border-[#1E293B] p-3">
						<div className="text-xs text-muted-foreground">Total Balance</div>
						<div className="text-2xl font-bold font-mono text-white">
							{showBalances ? `$${totalBalance.toLocaleString()}` : "••••"}
						</div>
					</div>
					<div className="bg-[#111827] rounded-lg border border-[#1E293B] p-3">
						<div className="text-xs text-muted-foreground">Total P/L</div>
						<div
							className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}
						>
							{showBalances
								? `${totalPnL >= 0 ? "+" : ""}$${totalPnL.toLocaleString()}`
								: "••••"}
						</div>
					</div>
					<div className="bg-[#111827] rounded-lg border border-[#1E293B] p-3">
						<div className="text-xs text-muted-foreground">
							Default Bankroll
						</div>
						<div className="text-2xl font-bold font-mono text-[#A855F7]">
							${defaultBankroll.toLocaleString()}
						</div>
					</div>
					<div className="bg-[#111827] rounded-lg border border-[#1E293B] p-3">
						<div className="text-xs text-muted-foreground">ROI</div>
						<div
							className={`text-2xl font-bold font-mono ${totalPnL >= 0 ? "text-[#00FF88]" : "text-[#FF4466]"}`}
						>
							{((totalPnL / totalBalance) * 100).toFixed(1)}%
						</div>
					</div>
				</div>

				{/* Charts */}
				<div className="grid lg:grid-cols-2 gap-5">
					<div className="bg-[#111827] rounded-lg border border-[#1E293B] p-4">
						<h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
							<DollarSign className="size-4 text-[#00D4FF]" /> Balance by
							Platform
						</h3>
						<div className="h-[180px]">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={PLATFORMS_DEFAULT} barSize={32}>
									<CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
									<XAxis
										dataKey="name"
										tick={{ fill: "#7B8BA8", fontSize: 10 }}
										axisLine={{ stroke: "#1E293B" }}
									/>
									<YAxis
										tick={{ fill: "#7B8BA8", fontSize: 10 }}
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
									<Bar dataKey="balance" radius={[4, 4, 0, 0]}>
										{PLATFORMS_DEFAULT.map((_, index) => (
											<Cell
												key={index}
												fill={CHART_COLORS[index % CHART_COLORS.length]}
											/>
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-[#111827] rounded-lg border border-[#1E293B] p-4">
						<h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
							<Palette className="size-4 text-[#A855F7]" /> P/L by Sport
						</h3>
						<div className="h-[180px] flex items-center justify-center">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={PL_BY_SPORT.filter((s) => s.value > 0)}
										cx="50%"
										cy="50%"
										innerRadius={45}
										outerRadius={70}
										paddingAngle={3}
										dataKey="value"
									>
										{PL_BY_SPORT.filter((s) => s.value > 0).map((_, index) => (
											<Cell
												key={index}
												fill={CHART_COLORS[index % CHART_COLORS.length]}
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
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="flex flex-wrap justify-center gap-3 mt-2">
							{PL_BY_SPORT.map((s, i) => (
								<div key={s.name} className="flex items-center gap-1.5 text-xs">
									<div
										className="size-2 rounded-full"
										style={{
											backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
										}}
									/>
									<span
										className={s.pnl >= 0 ? "text-[#00FF88]" : "text-[#FF4466]"}
									>
										{s.name} ({s.pnl >= 0 ? "+" : ""}${s.pnl})
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="grid lg:grid-cols-2 gap-5">
				{/* Analysis Settings */}
				<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5 space-y-5">
					<h2 className="font-semibold text-white flex items-center gap-2">
						<Sliders className="size-4 text-[#00D4FF]" /> Analysis Preferences
					</h2>

					{/* Edge Sensitivity */}
					<div>
						<label
							htmlFor="edgeSens"
							className="text-xs text-muted-foreground mb-2 block"
						>
							Edge Sensitivity (Min Edge %)
						</label>
						<div className="flex items-center gap-3">
							<input
								id="edgeSens"
								type="range"
								min={0}
								max={20}
								value={edgeSens}
								onChange={(e) => setEdgeSens(Number(e.target.value))}
								className="flex-1 h-1.5 bg-[#1E293B] rounded-full appearance-none accent-[#00FF88]"
							/>
							<span className="text-sm font-mono text-[#00FF88] w-10 text-right">
								{edgeSens}%
							</span>
						</div>
					</div>

					{/* Min Confidence */}
					<div>
						<label
							htmlFor="minConf"
							className="text-xs text-muted-foreground mb-2 block"
						>
							Minimum Confidence Filter
						</label>
						<div className="flex items-center gap-3">
							<input
								id="minConf"
								type="range"
								min={30}
								max={90}
								value={minConf}
								onChange={(e) => setMinConf(Number(e.target.value))}
								className="flex-1 h-1.5 bg-[#1E293B] rounded-full appearance-none accent-[#00D4FF]"
							/>
							<span className="text-sm font-mono text-[#00D4FF] w-10 text-right">
								{minConf}%
							</span>
						</div>
					</div>

					{/* Default Bankroll */}
					<div>
						<label
							htmlFor="bankroll"
							className="text-xs text-muted-foreground mb-2 block"
						>
							Default Bankroll
						</label>
						<div className="flex items-center gap-2">
							<DollarSign className="size-4 text-muted-foreground" />
							<Input
								id="bankroll"
								type="number"
								value={defaultBankroll}
								onChange={(e) => setDefaultBankroll(Number(e.target.value))}
								className="bg-[#0A0E17] border-[#1E293B] text-white max-w-[150px]"
							/>
						</div>
					</div>

					{/* Kalshi Toggle */}
					<div className="flex items-center justify-between">
						<div>
							<span className="text-sm text-white">Show Kalshi Markets</span>
							<p className="text-xs text-muted-foreground">
								Display prediction market data
							</p>
						</div>
						<button
							type="button"
							onClick={() => setShowKalshi(!showKalshi)}
							className={`relative w-11 h-6 rounded-full transition-colors ${showKalshi ? "bg-[#A855F7]" : "bg-[#1E293B]"}`}
						>
							<div
								className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${showKalshi ? "translate-x-5.5 left-0.5" : "left-0.5"}`}
								style={{
									transform: showKalshi ? "translateX(22px)" : "translateX(0)",
								}}
							/>
						</button>
					</div>
				</div>

				{/* Sports & Platforms */}
				<div className="space-y-5">
					<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
						<h2 className="font-semibold text-white flex items-center gap-2 mb-4">
							<User className="size-4 text-[#FFB800]" /> Sports & Platforms
						</h2>

						<div className="mb-4">
							<label
								htmlFor="favSports"
								className="text-xs text-muted-foreground mb-2 block"
							>
								Favorite Sports
							</label>
							<div className="flex flex-wrap gap-2">
								{[
									"NBA",
									"NFL",
									"MLB",
									"NHL",
									"CFB",
									"Soccer",
									"Tennis",
									"Esports",
								].map((sport) => (
									<button
										type="button"
										key={sport}
										onClick={() => toggleSport(sport)}
										className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
											favSports.includes(sport)
												? "bg-[#00FF88]/10 border-[#00FF88]/30 text-[#00FF88]"
												: "bg-[#0A0E17] border-[#1E293B] text-muted-foreground hover:text-white"
										}`}
									>
										{sport}
									</button>
								))}
							</div>
						</div>

						<div>
							<span className="text-xs text-muted-foreground mb-2 block">
								Tracked Platforms
							</span>
							<div className="flex flex-wrap gap-2">
								{[
									"PrizePicks",
									"Underdog",
									"Sleeper",
									"DraftKings Pick6",
									"Kalshi",
								].map((platform) => (
									<button
										type="button"
										key={platform}
										onClick={() => togglePlatform(platform)}
										className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
											favPlatforms.includes(platform)
												? "bg-[#A855F7]/10 border-[#A855F7]/30 text-[#A855F7]"
												: "bg-[#0A0E17] border-[#1E293B] text-muted-foreground hover:text-white"
										}`}
									>
										{platform}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Alerts */}
					<div className="bg-[#111827] rounded-xl border border-[#1E293B] p-5">
						<h2 className="font-semibold text-white flex items-center gap-2 mb-4">
							<Bell className="size-4 text-[#FF4466]" /> Alerts
						</h2>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div>
									<span className="text-sm text-white">High Edge Alerts</span>
									<p className="text-xs text-muted-foreground">
										Notify when edge &gt; 15%
									</p>
								</div>
								<button
									type="button"
									onClick={() => setAlertHigh(!alertHigh)}
									className={`relative w-11 h-6 rounded-full transition-colors ${alertHigh ? "bg-[#00FF88]" : "bg-[#1E293B]"}`}
								>
									<div
										className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform"
										style={{
											transform: alertHigh
												? "translateX(22px)"
												: "translateX(0)",
										}}
									/>
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<span className="text-sm text-white">Hot Streak Alerts</span>
									<p className="text-xs text-muted-foreground">
										Notify on hot/cold streaks
									</p>
								</div>
								<button
									type="button"
									onClick={() => setAlertStreak(!alertStreak)}
									className={`relative w-11 h-6 rounded-full transition-colors ${alertStreak ? "bg-[#00FF88]" : "bg-[#1E293B]"}`}
								>
									<div
										className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform"
										style={{
											transform: alertStreak
												? "translateX(22px)"
												: "translateX(0)",
										}}
									/>
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<span className="text-sm text-white">Dark Mode</span>
									<p className="text-xs text-muted-foreground">
										Premium dark theme
									</p>
								</div>
								<button
									type="button"
									onClick={() => setDarkMode(!darkMode)}
									className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-[#A855F7]" : "bg-[#1E293B]"}`}
								>
									<div
										className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform"
										style={{
											transform: darkMode
												? "translateX(22px)"
												: "translateX(0)",
										}}
									/>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-2">
				<Button
					onClick={handleSave}
					className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E17] font-bold px-8 gap-2"
				>
					<Save className="size-4" /> Save Settings
				</Button>
			</div>
		</div>
	);
}
