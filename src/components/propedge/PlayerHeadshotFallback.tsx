/**
 * PlayerHeadshotFallback — R13 Premium Visual
 *
 * Beautiful fallback for missing player headshots.
 * Shows team-colored gradient with initials + silhouette.
 * Handles real images with graceful error fallback.
 */

import { User } from "lucide-react";
import { useState } from "react";
import { getPlayerInitials, getTeamColors } from "../../lib/assets";

interface Props {
	playerName: string;
	team?: string;
	headshotUrl?: string;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}

const SIZES = {
	sm: { container: "size-8", text: "text-[10px]", icon: "size-3" },
	md: { container: "size-12", text: "text-sm", icon: "size-5" },
	lg: { container: "size-16", text: "text-lg", icon: "size-6" },
	xl: { container: "size-24", text: "text-2xl", icon: "size-8" },
};

export function PlayerHeadshotFallback({
	playerName,
	team,
	headshotUrl,
	size = "md",
	className = "",
}: Props) {
	const [imgError, setImgError] = useState(false);
	const colors = getTeamColors(team || "");
	const initials = getPlayerInitials(playerName);
	const s = SIZES[size];

	// Show real headshot if available and not errored
	if (headshotUrl && !imgError) {
		return (
			<div
				className={`${s.container} rounded-full overflow-hidden border-2 border-white/10 ${className}`}
			>
				<img
					src={headshotUrl}
					alt={playerName}
					className="w-full h-full object-cover"
					onError={() => setImgError(true)}
					loading="lazy"
				/>
			</div>
		);
	}

	// Premium fallback with team colors
	return (
		<div
			className={`${s.container} rounded-full flex items-center justify-center border-2 border-white/10 relative overflow-hidden ${className}`}
			style={{
				background: `linear-gradient(145deg, ${colors.primary}CC, ${colors.secondary}99)`,
			}}
		>
			{/* Subtle silhouette */}
			<User
				className={`${s.icon} absolute opacity-10 translate-y-1`}
				style={{ color: "#ffffff" }}
			/>

			{/* Initials */}
			<span className={`${s.text} font-black relative z-10 text-white/90`}>
				{initials}
			</span>
		</div>
	);
}
