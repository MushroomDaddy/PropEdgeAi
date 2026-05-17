/**
 * SyncHealthPanel — R13 Premium Visual
 *
 * Overview panel showing sync health across all providers.
 * Animated bars, live indicators, error counts.
 */

import { motion } from "framer-motion";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Database,
	XCircle,
} from "lucide-react";

interface ProviderHealth {
	name: string;
	displayName: string;
	status: "healthy" | "stale" | "error" | "offline";
	recordCount: number;
	lastSync?: number;
	freshPercent: number; // 0-100
}

interface Props {
	providers: ProviderHealth[];
	totalRecords?: number;
	className?: string;
}

const STATUS_ICONS = {
	healthy: { icon: CheckCircle2, color: "text-emerald-400" },
	stale: { icon: Clock, color: "text-amber-400" },
	error: { icon: AlertTriangle, color: "text-red-400" },
	offline: { icon: XCircle, color: "text-gray-500" },
};

function HealthBar({
	value,
	className = "",
}: {
	value: number;
	className?: string;
}) {
	const color =
		value >= 80
			? "bg-emerald-400"
			: value >= 50
				? "bg-amber-400"
				: "bg-red-400";
	return (
		<div
			className={`h-1.5 bg-white/5 rounded-full overflow-hidden ${className}`}
		>
			<motion.div
				initial={{ width: 0 }}
				animate={{ width: `${value}%` }}
				className={`h-full rounded-full ${color}`}
				transition={{ duration: 1.2, ease: "easeOut" }}
			/>
		</div>
	);
}

export function SyncHealthPanel({
	providers,
	totalRecords,
	className = "",
}: Props) {
	const healthyCount = providers.filter((p) => p.status === "healthy").length;
	const errorCount = providers.filter((p) => p.status === "error").length;
	const overallHealth =
		providers.length > 0
			? Math.round(
					providers.reduce((sum, p) => sum + p.freshPercent, 0) /
						providers.length,
				)
			: 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`bg-[#0A0E17] rounded-2xl border border-white/10 overflow-hidden ${className}`}
		>
			{/* Header */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
				<div className="flex items-center gap-2">
					<Activity className="size-4 text-cyan-400" />
					<span className="text-sm font-bold">Sync Health</span>
				</div>
				<div className="flex items-center gap-3 text-[10px]">
					<span className="text-emerald-400">{healthyCount} healthy</span>
					{errorCount > 0 && (
						<span className="text-red-400">{errorCount} error</span>
					)}
					{totalRecords !== undefined && (
						<span className="text-muted-foreground flex items-center gap-1">
							<Database className="size-3" />
							{totalRecords.toLocaleString()} records
						</span>
					)}
				</div>
			</div>

			{/* Overall health bar */}
			<div className="px-4 pt-3 pb-1">
				<div className="flex items-center justify-between mb-1.5">
					<span className="text-[10px] text-muted-foreground">
						Overall Data Freshness
					</span>
					<span
						className={`text-xs font-bold font-mono ${
							overallHealth >= 80
								? "text-emerald-400"
								: overallHealth >= 50
									? "text-amber-400"
									: "text-red-400"
						}`}
					>
						{overallHealth}%
					</span>
				</div>
				<HealthBar value={overallHealth} />
			</div>

			{/* Provider rows */}
			<div className="p-4 space-y-2.5">
				{providers.map((p, i) => {
					const si = STATUS_ICONS[p.status];
					const Icon = si.icon;
					return (
						<motion.div
							key={p.name}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: i * 0.05 }}
							className="flex items-center gap-3"
						>
							<Icon className={`size-3.5 shrink-0 ${si.color}`} />
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1">
									<span className="text-[11px] font-medium truncate">
										{p.displayName}
									</span>
									<span className="text-[9px] text-muted-foreground font-mono">
										{p.recordCount > 0 ? `${p.recordCount}` : "—"}
									</span>
								</div>
								<HealthBar value={p.freshPercent} />
							</div>
						</motion.div>
					);
				})}
			</div>
		</motion.div>
	);
}
