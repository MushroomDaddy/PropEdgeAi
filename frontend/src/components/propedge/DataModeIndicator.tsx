import { motion } from "framer-motion";
import { Database, Radio, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataModeIndicatorProps {
	mode: "demo" | "live" | "hybrid";
	totalProps?: number;
	liveEvents?: number;
	lastSync?: number;
	className?: string;
}

export function DataModeIndicator({
	mode,
	totalProps = 0,
	liveEvents = 0,
	lastSync,
	className,
}: DataModeIndicatorProps) {
	const configs = {
		demo: {
			label: "DEMO",
			sublabel: "Sample Data",
			icon: Database,
			color: "text-amber-400",
			bg: "bg-amber-500/10",
			border: "border-amber-500/20",
			glow: "shadow-amber-500/5",
			dot: "bg-amber-400",
		},
		live: {
			label: "LIVE",
			sublabel: "Real-Time",
			icon: Radio,
			color: "text-emerald-400",
			bg: "bg-emerald-500/10",
			border: "border-emerald-500/20",
			glow: "shadow-emerald-500/10",
			dot: "bg-emerald-400",
		},
		hybrid: {
			label: "HYBRID",
			sublabel: "Demo + Live",
			icon: Wifi,
			color: "text-cyan-400",
			bg: "bg-cyan-500/10",
			border: "border-cyan-500/20",
			glow: "shadow-cyan-500/5",
			dot: "bg-cyan-400",
		},
	};

	const config = configs[mode];
	const Icon = config.icon;

	const syncAge = lastSync ? Math.round((Date.now() - lastSync) / 60000) : null;
	const syncLabel =
		syncAge !== null
			? syncAge < 1
				? "Just now"
				: syncAge < 60
					? `${syncAge}m ago`
					: `${Math.round(syncAge / 60)}h ago`
			: null;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			className={cn(
				"inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-lg",
				config.bg,
				config.border,
				config.glow,
				className,
			)}
		>
			<div className="relative">
				<Icon className={cn("size-3.5", config.color)} />
				{mode === "live" && (
					<motion.div
						className={cn(
							"absolute -top-0.5 -right-0.5 size-1.5 rounded-full",
							config.dot,
						)}
						animate={{ opacity: [1, 0.3, 1] }}
						transition={{ duration: 1.5, repeat: Infinity }}
					/>
				)}
			</div>
			<div className="flex flex-col">
				<span
					className={cn(
						"text-[10px] font-bold tracking-wider leading-none",
						config.color,
					)}
				>
					{config.label}
				</span>
				<span className="text-[8px] text-muted-foreground/60 leading-none mt-0.5">
					{config.sublabel}
				</span>
			</div>
			{totalProps > 0 && (
				<span className="text-[10px] text-muted-foreground/50 ml-1">
					{totalProps} props
				</span>
			)}
			{liveEvents > 0 && (
				<span className="text-[10px] text-emerald-400/60 ml-0.5">
					{liveEvents} live
				</span>
			)}
			{syncLabel && (
				<span className="text-[8px] text-muted-foreground/40 ml-1 flex items-center gap-0.5">
					{syncAge !== null && syncAge > 60 ? (
						<WifiOff className="size-2.5" />
					) : null}
					{syncLabel}
				</span>
			)}
		</motion.div>
	);
}
