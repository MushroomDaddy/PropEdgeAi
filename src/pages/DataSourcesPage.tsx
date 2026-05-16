import { useAction } from "convex/react";
import {
	Activity,
	AlertTriangle,
	BarChart3,
	CheckCircle2,
	Clock,
	Database,
	Radio,
	RefreshCw,
	Server,
	Shield,
	WifiOff,
	XCircle,
	Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { DemoBanner } from "../components/propedge";

function HealthBar({ value }: { value: number }) {
	const color =
		value >= 80
			? "bg-emerald-400"
			: value >= 50
				? "bg-amber-400"
				: "bg-red-400";
	return (
		<div className="flex items-center gap-2">
			<div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
				<div
					className={`h-full ${color} rounded-full transition-all`}
					style={{ width: `${value}%` }}
				/>
			</div>
			<span className="text-xs font-mono w-8 text-right">{value}%</span>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const styles: Record<string, string> = {
		active: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
		inactive: "bg-gray-400/10 text-gray-400 border-gray-400/20",
		error: "bg-red-400/10 text-red-400 border-red-400/20",
		demo: "bg-amber-400/10 text-amber-400 border-amber-400/20",
		live: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
	};
	const icons: Record<string, ReactNode> = {
		active: <CheckCircle2 className="size-3" />,
		inactive: <WifiOff className="size-3" />,
		error: <XCircle className="size-3" />,
		demo: <AlertTriangle className="size-3" />,
		live: <Radio className="size-3" />,
	};
	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles.inactive}`}
		>
			{icons[status] || icons.inactive} {status.toUpperCase()}
		</span>
	);
}

function RefreshStatusBadge({ status }: { status: string }) {
	const config: Record<
		string,
		{ color: string; icon: ReactNode; label: string }
	> = {
		fresh: {
			color: "text-emerald-400",
			icon: <CheckCircle2 className="size-3" />,
			label: "Fresh",
		},
		updating: {
			color: "text-amber-400",
			icon: <RefreshCw className="size-3 animate-spin" />,
			label: "Updating",
		},
		stale: {
			color: "text-red-400",
			icon: <Clock className="size-3" />,
			label: "Stale",
		},
		failed: {
			color: "text-red-500",
			icon: <XCircle className="size-3" />,
			label: "Failed",
		},
		demo: {
			color: "text-amber-400",
			icon: <AlertTriangle className="size-3" />,
			label: "Demo",
		},
		never: {
			color: "text-gray-400",
			icon: <Clock className="size-3" />,
			label: "Never Synced",
		},
	};
	const c = config[status] || config.never;
	return (
		<span
			className={`inline-flex items-center gap-1 text-[10px] font-mono ${c.color}`}
		>
			{c.icon} {c.label}
		</span>
	);
}

function ResultPanel({ result, error }: { result: any; error: string | null }) {
	if (!result && !error) return null;
	return (
		<div className="mt-2 bg-black/30 rounded-lg p-2 text-[10px] font-mono overflow-auto max-h-32">
			{error ? (
				<div className="text-red-400">{error}</div>
			) : (
				<pre className="text-emerald-400">
					{JSON.stringify(result, null, 2)}
				</pre>
			)}
		</div>
	);
}

export default function DataSourcesPage() {
	const data = useQuery(api.providerStatus.allProviders);

	// Action hooks for sync buttons
	const adminFullSync = useAction(api.adminSync.adminFullSync);
	const adminRefreshGames = useAction(api.adminSync.adminRefreshGames);
	const adminRefreshOdds = useAction(api.adminSync.adminRefreshOdds);
	const adminRefreshProps = useAction(api.adminSync.adminRefreshProps);
	const adminApiSportsFullSync = useAction(
		api.adminSync.adminApiSportsFullSync,
	);
	const adminApiSportsSyncTeams = useAction(
		api.adminSync.adminApiSportsSyncTeams,
	);
	const adminApiSportsSyncGames = useAction(
		api.adminSync.adminApiSportsSyncGames,
	);
	const adminApiSportsSyncStandings = useAction(
		api.adminSync.adminApiSportsSyncStandings,
	);
	const adminApiSportsSyncLiveScores = useAction(
		api.adminSync.adminApiSportsSyncLiveScores,
	);
	const adminApiSportsSyncInjuries = useAction(
		api.adminSync.adminApiSportsSyncInjuries,
	);

	// State for loading/results/errors
	const [loading, setLoading] = useState<Record<string, boolean>>({});
	const [results, setResults] = useState<Record<string, any>>({});
	const [errors, setErrors] = useState<Record<string, string | null>>({});

	const isHybridMode = data?.mode === "hybrid";
	const isDemo = data?.mode === "demo";

	const runAction = async (actionName: string, action: any, args: any = {}) => {
		setLoading((prev) => ({ ...prev, [actionName]: true }));
		setErrors((prev) => ({ ...prev, [actionName]: null }));
		try {
			const result = await action(args);
			setResults((prev) => ({ ...prev, [actionName]: result }));
		} catch (err: any) {
			setErrors((prev) => ({
				...prev,
				[actionName]: err.message || "Unknown error",
			}));
		} finally {
			setLoading((prev) => ({ ...prev, [actionName]: false }));
		}
	};

	return (
		<div className="p-6 max-w-5xl mx-auto space-y-6">
			<DemoBanner />

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Database className="size-6 text-[#00D4FF]" />
						Data Sources
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Provider integrations, sync status, and data health
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div
						className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
							isHybridMode
								? "bg-cyan-400/5 border-cyan-400/20"
								: "bg-amber-400/5 border-amber-400/20"
						}`}
					>
						{isHybridMode ? (
							<>
								<Zap className="size-4 text-cyan-400" />
								<span className="text-xs font-bold text-cyan-400">
									HYBRID MODE
								</span>
							</>
						) : (
							<>
								<Shield className="size-4 text-amber-400" />
								<span className="text-xs font-bold text-amber-400">
									DEMO MODE
								</span>
							</>
						)}
					</div>
				</div>
			</div>

			{/* DB Stats */}
			{data && (
				<div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
					{[
						{ label: "Demo Props", value: data.dbStats.props, icon: "📊" },
						{ label: "Players", value: data.dbStats.players, icon: "👤" },
						{ label: "Games", value: data.dbStats.games, icon: "🏟️" },
						{ label: "My Results", value: data.dbStats.myResults, icon: "✅" },
						{ label: "Kalshi", value: data.dbStats.kalshiMarkets, icon: "📈" },
						{
							label: "My Imports",
							value: data.dbStats.myImportJobs,
							icon: "📥",
						},
						{
							label: "Live Events",
							value: data.dbStats.liveEvents || 0,
							icon: "🔴",
						},
						{
							label: "Live Odds",
							value: data.dbStats.liveOdds || 0,
							icon: "💰",
						},
					].map((s) => (
						<div
							key={s.label}
							className="bg-[#0D1117] rounded-xl border border-white/5 p-3 text-center"
						>
							<div className="text-xs mb-1">{s.icon}</div>
							<div className="text-lg font-bold font-mono">{s.value}</div>
							<div className="text-[10px] text-muted-foreground">{s.label}</div>
						</div>
					))}
				</div>
			)}

			{/* Live data freshness bar */}
			{data && (data.dbStats.liveEvents > 0 || data.dbStats.liveOdds > 0) && (
				<div className="bg-[#0D1117] rounded-xl border border-cyan-400/10 p-4 space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-bold flex items-center gap-2">
							<Radio className="size-4 text-cyan-400" /> Live Data Health
						</span>
						<div className="flex gap-3 text-[10px] font-mono">
							<span className="text-emerald-400">
								● {data.dbStats.freshEvents || 0} fresh
							</span>
							<span className="text-red-400">
								● {data.dbStats.staleEvents || 0} stale
							</span>
						</div>
					</div>
					<HealthBar
						value={
							data.dbStats.liveEvents > 0
								? Math.round(
										((data.dbStats.freshEvents || 0) /
											data.dbStats.liveEvents) *
											100,
									)
								: 0
						}
					/>
				</div>
			)}

			{/* Provider Cards */}
			<div className="space-y-3">
				{data?.providers?.map((p: any) => (
					<div
						key={p.provider}
						className={`bg-[#0D1117] rounded-xl border p-4 space-y-3 ${
							p.isLive && p.apiKeyConfigured
								? "border-cyan-400/20"
								: "border-white/5"
						}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div
									className={`size-10 rounded-lg flex items-center justify-center ${
										p.isLive
											? "bg-cyan-400/10"
											: p.status === "active"
												? "bg-emerald-400/10"
												: "bg-white/5"
									}`}
								>
									<Server
										className={`size-5 ${
											p.isLive
												? "text-cyan-400"
												: p.status === "active"
													? "text-emerald-400"
													: "text-muted-foreground"
										}`}
									/>
								</div>
								<div>
									<div className="font-bold text-sm flex items-center gap-2">
										{p.displayName}
										{p.isLive && p.apiKeyConfigured && (
											<span className="text-[10px] px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 rounded-full font-mono">
												LIVE
											</span>
										)}
									</div>
									<div className="text-[10px] text-muted-foreground flex items-center gap-2">
										{p.isDemoMode ? (
											<span className="flex items-center gap-1 text-amber-400">
												<AlertTriangle className="size-3" /> Active — Demo Mode
											</span>
										) : p.provider === "manual_import" ? (
											<span className="flex items-center gap-1 text-emerald-400">
												<Activity className="size-3" /> Available — Manual Entry
												& CSV
											</span>
										) : p.provider === "screenshot_import" ? (
											<span className="flex items-center gap-1 text-gray-400">
												<WifiOff className="size-3" /> Placeholder — Coming Soon
											</span>
										) : p.isLive && p.apiKeyConfigured ? (
											<span className="flex items-center gap-1 text-cyan-400">
												<Zap className="size-3" /> Connected — Live Data
											</span>
										) : (
											<span className="flex items-center gap-1 text-gray-400">
												<WifiOff className="size-3" /> Not Connected
											</span>
										)}
										{p.requiresApiKey && !p.apiKeyConfigured && (
											<span className="text-red-400">• API Key Required</span>
										)}
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{p.refreshStatus && (
									<RefreshStatusBadge status={p.refreshStatus} />
								)}
								<StatusBadge
									status={
										p.isLive && p.apiKeyConfigured
											? "live"
											: p.isDemoMode
												? "demo"
												: p.status
									}
								/>
							</div>
						</div>

						<HealthBar value={p.providerHealth} />

						<div className="flex flex-wrap gap-1.5">
							{p.supportedSports?.map((s: string) => (
								<span
									key={s}
									className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-mono"
								>
									{s}
								</span>
							))}
						</div>

						{/* Rate limit info */}
						{p.rateLimit && (
							<div className="flex items-center gap-4 text-[10px] text-muted-foreground">
								<span className="flex items-center gap-1">
									<BarChart3 className="size-3" />
									{p.requestsUsed || 0} / {p.rateLimit} requests used
								</span>
								<div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
									<div
										className={`h-full rounded-full ${
											(p.requestsUsed || 0) / p.rateLimit > 0.8
												? "bg-red-400"
												: "bg-emerald-400"
										}`}
										style={{
											width: `${Math.min(100, ((p.requestsUsed || 0) / p.rateLimit) * 100)}%`,
										}}
									/>
								</div>
							</div>
						)}

						{/* Last sync info */}
						{p.lastSyncTime && (
							<div className="text-[10px] text-muted-foreground flex items-center gap-2">
								<Clock className="size-3" />
								Last sync: {new Date(p.lastSyncTime).toLocaleString()}
								{p.lastSyncRecords > 0 && ` • ${p.lastSyncRecords} records`}
								{p.lastSyncStatus === "error" && p.lastSyncError && (
									<span className="text-red-400"> • {p.lastSyncError}</span>
								)}
							</div>
						)}

						{/* Data type badge */}
						{(p.provider === "api_sports" || p.provider === "balldontlie") && (
							<div className="flex items-center gap-2">
								<span className="px-2 py-0.5 bg-purple-400/10 text-purple-400 rounded text-[10px] font-bold border border-purple-400/20">
									Structured Data
								</span>
								{p.provider === "api_sports" && (
									<span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20">
										Official Stats
									</span>
								)}
							</div>
						)}
						{p.provider === "thesportsdb" && (
							<span className="px-2 py-0.5 bg-pink-400/10 text-pink-400 rounded text-[10px] font-bold border border-pink-400/20">
								Media / Visuals
							</span>
						)}
						{p.provider === "serpapi" && (
							<span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-400 rounded text-[10px] font-bold border border-yellow-400/20">
								Context Only
							</span>
						)}

						{/* REAL SYNC BUTTONS - Step 2 Implementation */}
						<div className="space-y-2 mt-3">
							{/* The Odds API Buttons */}
							{p.provider === "the_odds_api" && p.apiKeyConfigured && (
								<div className="bg-white/5 rounded-lg p-3 space-y-2">
									<div className="font-bold text-white/80 text-[11px]">
										The Odds API Sync
									</div>
									<div className="flex flex-wrap gap-2">
										<button
											onClick={() =>
												runAction("adminFullSync", adminFullSync, {
													sport: "NBA",
												})
											}
											disabled={loading["adminFullSync"]}
											className="px-3 py-1.5 bg-cyan-400/10 text-cyan-400 rounded text-[10px] font-bold border border-cyan-400/20 hover:bg-cyan-400/20 disabled:opacity-50"
										>
											{loading["adminFullSync"]
												? "Running..."
												: "Full Sync (NBA)"}
										</button>
										<button
											onClick={() =>
												runAction("adminRefreshGames", adminRefreshGames, {
													sport: "NBA",
												})
											}
											disabled={loading["adminRefreshGames"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminRefreshGames"]
												? "Running..."
												: "Refresh Games"}
										</button>
										<button
											onClick={() =>
												runAction("adminRefreshOdds", adminRefreshOdds, {
													sport: "NBA",
													markets: "h2h,spreads,totals",
												})
											}
											disabled={loading["adminRefreshOdds"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminRefreshOdds"]
												? "Running..."
												: "Refresh Odds"}
										</button>
										<button
											onClick={() =>
												runAction("adminRefreshProps", adminRefreshProps, {
													sport: "NBA",
													maxEvents: 3,
												})
											}
											disabled={loading["adminRefreshProps"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminRefreshProps"]
												? "Running..."
												: "Refresh Props"}
										</button>
									</div>
									<ResultPanel
										result={results["adminFullSync"]}
										error={errors["adminFullSync"]}
									/>
									<ResultPanel
										result={results["adminRefreshGames"]}
										error={errors["adminRefreshGames"]}
									/>
									<ResultPanel
										result={results["adminRefreshOdds"]}
										error={errors["adminRefreshOdds"]}
									/>
									<ResultPanel
										result={results["adminRefreshProps"]}
										error={errors["adminRefreshProps"]}
									/>
								</div>
							)}

							{/* API-SPORTS Buttons */}
							{p.provider === "api_sports" && p.apiKeyConfigured && (
								<div className="bg-white/5 rounded-lg p-3 space-y-2">
									<div className="font-bold text-white/80 text-[11px]">
										API-SPORTS Sync
									</div>
									<div className="flex flex-wrap gap-2">
										<button
											onClick={() =>
												runAction(
													"adminApiSportsFullSync",
													adminApiSportsFullSync,
													{ sport: "NBA" },
												)
											}
											disabled={loading["adminApiSportsFullSync"]}
											className="px-3 py-1.5 bg-cyan-400/10 text-cyan-400 rounded text-[10px] font-bold border border-cyan-400/20 hover:bg-cyan-400/20 disabled:opacity-50"
										>
											{loading["adminApiSportsFullSync"]
												? "Running..."
												: "Full Sync (NBA)"}
										</button>
										<button
											onClick={() =>
												runAction(
													"adminApiSportsSyncTeams",
													adminApiSportsSyncTeams,
													{ sport: "NBA" },
												)
											}
											disabled={loading["adminApiSportsSyncTeams"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminApiSportsSyncTeams"]
												? "Running..."
												: "Sync Teams"}
										</button>
										<button
											onClick={() =>
												runAction(
													"adminApiSportsSyncGames",
													adminApiSportsSyncGames,
													{ sport: "NBA" },
												)
											}
											disabled={loading["adminApiSportsSyncGames"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminApiSportsSyncGames"]
												? "Running..."
												: "Sync Games"}
										</button>
										<button
											onClick={() =>
												runAction(
													"adminApiSportsSyncStandings",
													adminApiSportsSyncStandings,
													{ sport: "NBA" },
												)
											}
											disabled={loading["adminApiSportsSyncStandings"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminApiSportsSyncStandings"]
												? "Running..."
												: "Sync Standings"}
										</button>
										<button
											onClick={() =>
												runAction(
													"adminApiSportsSyncLiveScores",
													adminApiSportsSyncLiveScores,
													{ sport: "NBA" },
												)
											}
											disabled={loading["adminApiSportsSyncLiveScores"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminApiSportsSyncLiveScores"]
												? "Running..."
												: "Sync Live Scores"}
										</button>
										<button
											onClick={() =>
												runAction(
													"adminApiSportsSyncInjuries",
													adminApiSportsSyncInjuries,
													{ sport: "NFL" },
												)
											}
											disabled={loading["adminApiSportsSyncInjuries"]}
											className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded text-[10px] font-bold border border-emerald-400/20 hover:bg-emerald-400/20 disabled:opacity-50"
										>
											{loading["adminApiSportsSyncInjuries"]
												? "Running..."
												: "Sync Injuries (NFL)"}
										</button>
									</div>
									<ResultPanel
										result={results["adminApiSportsFullSync"]}
										error={errors["adminApiSportsFullSync"]}
									/>
									<ResultPanel
										result={results["adminApiSportsSyncTeams"]}
										error={errors["adminApiSportsSyncTeams"]}
									/>
									<ResultPanel
										result={results["adminApiSportsSyncGames"]}
										error={errors["adminApiSportsSyncGames"]}
									/>
									<ResultPanel
										result={results["adminApiSportsSyncStandings"]}
										error={errors["adminApiSportsSyncStandings"]}
									/>
									<ResultPanel
										result={results["adminApiSportsSyncLiveScores"]}
										error={errors["adminApiSportsSyncLiveScores"]}
									/>
									<ResultPanel
										result={results["adminApiSportsSyncInjuries"]}
										error={errors["adminApiSportsSyncInjuries"]}
									/>
								</div>
							)}

							{/* Setup Instructions for Missing Keys */}
							{p.requiresApiKey &&
								!p.apiKeyConfigured &&
								p.provider === "the_odds_api" && (
									<div className="bg-white/5 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1">
										<div className="font-bold text-white/80">
											🔑 Setup Instructions
										</div>
										<div>
											1. Get a free API key at{" "}
											<span className="text-cyan-400">the-odds-api.com</span>
										</div>
										<div>
											2. Add{" "}
											<code className="bg-black/30 px-1 rounded">
												THE_ODDS_API_KEY
											</code>{" "}
											to your Convex environment variables
										</div>
										<div className="text-amber-400 mt-1">
											Free tier: 500 requests/month • Covers NBA, NFL, MLB, NHL
											+
										</div>
									</div>
								)}
							{p.requiresApiKey &&
								!p.apiKeyConfigured &&
								p.provider === "api_sports" && (
									<div className="bg-white/5 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1">
										<div className="font-bold text-white/80">
											🔑 Setup Instructions
										</div>
										<div>
											1. Get an API key at{" "}
											<span className="text-cyan-400">api-sports.io</span>
										</div>
										<div>
											2. Add{" "}
											<code className="bg-black/30 px-1 rounded">
												API_SPORTS_KEY
											</code>{" "}
											to your Convex environment variables
										</div>
										<div className="text-amber-400 mt-1">
											Free tier: 100 requests/day • Teams, players, games,
											standings, injuries, live scores
										</div>
									</div>
								)}
							{p.requiresApiKey &&
								!p.apiKeyConfigured &&
								p.provider === "thesportsdb" && (
									<div className="bg-white/5 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1">
										<div className="font-bold text-white/80">
											🔑 Setup Instructions
										</div>
										<div>
											1. Get a key at{" "}
											<span className="text-cyan-400">thesportsdb.com</span>{" "}
											(free for dev: use "123")
										</div>
										<div>
											2. Add{" "}
											<code className="bg-black/30 px-1 rounded">
												THESPORTSDB_API_KEY
											</code>{" "}
											to your Convex environment variables
										</div>
										<div className="text-amber-400 mt-1">
											Team logos, player images, badges, fanart, jersey visuals
										</div>
									</div>
								)}
						</div>
					</div>
				))}
			</div>

			{/* No API key warning */}
			{isDemo && (
				<div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-4 text-sm text-amber-400 flex items-start gap-3">
					<AlertTriangle className="size-5 mt-0.5 shrink-0" />
					<div>
						<div className="font-bold">Demo Mode Active</div>
						<div className="text-amber-400/80 mt-1">
							All data is simulated. Connect a provider API key to see real live
							odds, games, and player props. Demo data will remain available
							alongside live data.
						</div>
					</div>
				</div>
			)}

			{!data && (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="bg-[#0D1117] rounded-xl border border-white/5 p-4 h-28 animate-pulse"
						/>
					))}
				</div>
			)}
		</div>
	);
}
