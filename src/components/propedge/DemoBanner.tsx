import { AlertTriangle } from "lucide-react";

export function DemoBanner({ message }: { message?: string }) {
	return (
		<div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-amber-600/5 px-4 py-2.5 text-sm text-amber-400/90">
			<AlertTriangle className="size-4 shrink-0" />
			<span>
				{message ||
					"DEMO DATA — Shown data is mock for demonstration. Connect live APIs for real data."}
			</span>
		</div>
	);
}
