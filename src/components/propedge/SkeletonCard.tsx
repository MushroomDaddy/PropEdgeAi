import { cn } from "@/lib/utils";

export function SkeletonCard({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"rounded-xl border border-white/5 bg-card/50 p-5 animate-pulse",
				className,
			)}
		>
			<div className="h-3 w-24 rounded bg-white/10 mb-3" />
			<div className="h-6 w-32 rounded bg-white/10 mb-2" />
			<div className="h-3 w-48 rounded bg-white/5" />
		</div>
	);
}

export function SkeletonRow() {
	return (
		<div className="flex items-center gap-4 py-3 px-4 animate-pulse">
			<div className="h-4 w-16 rounded bg-white/10" />
			<div className="h-4 w-28 rounded bg-white/10" />
			<div className="h-4 flex-1 rounded bg-white/5" />
			<div className="h-4 w-16 rounded bg-white/10" />
		</div>
	);
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
	return (
		<div className="rounded-xl border border-white/5 bg-card/50 overflow-hidden">
			<div className="flex items-center gap-4 px-4 py-3 border-b border-white/10 animate-pulse">
				{[80, 120, 60, 60, 80, 60].map((w, i) => (
					<div
						key={i}
						className="h-3 rounded bg-white/10"
						style={{ width: w }}
					/>
				))}
			</div>
			{Array.from({ length: rows }).map((_, i) => (
				<SkeletonRow key={i} />
			))}
		</div>
	);
}
