/**
 * MediaAssetImage — R13 Premium Visual
 *
 * Smart image component that:
 * 1. Tries provider headshot/logo URL
 * 2. Falls back to cached URL
 * 3. Shows premium placeholder with team colors
 *
 * Handles loading states, errors, and lazy loading.
 */

import { motion } from "framer-motion";
import { useState } from "react";
import {
	getPlayerInitials,
	getTeamAbbr,
	getTeamColors,
} from "../../lib/assets";

interface Props {
	type: "headshot" | "logo" | "badge" | "fanart";
	entityName: string;
	team?: string;
	sourceUrl?: string;
	cachedUrl?: string;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}

const SIZES = {
	sm: "size-8",
	md: "size-12",
	lg: "size-16",
	xl: "size-24",
};

const TEXT_SIZES = {
	sm: "text-[10px]",
	md: "text-sm",
	lg: "text-lg",
	xl: "text-2xl",
};

export function MediaAssetImage({
	type,
	entityName,
	team,
	sourceUrl,
	cachedUrl,
	size = "md",
	className = "",
}: Props) {
	const [imgState, setImgState] = useState<"loading" | "loaded" | "error">(
		"loading",
	);
	const [useFallback, setUseFallback] = useState(!sourceUrl && !cachedUrl);

	const colors = getTeamColors(team || entityName);
	const url = sourceUrl || cachedUrl;
	const isRound = type === "headshot";
	const sizeClass = SIZES[size];
	const textSize = TEXT_SIZES[size];

	// If no URL at all, go straight to fallback
	if (!url || useFallback) {
		const label =
			type === "headshot"
				? getPlayerInitials(entityName)
				: getTeamAbbr(entityName);

		return (
			<div
				className={`${sizeClass} ${isRound ? "rounded-full" : "rounded-xl"} flex items-center justify-center border border-white/10 ${className}`}
				style={{
					background: `linear-gradient(145deg, ${colors.primary}BB, ${colors.secondary}88)`,
				}}
			>
				<span className={`${textSize} font-black text-white/90`}>{label}</span>
			</div>
		);
	}

	return (
		<div
			className={`${sizeClass} ${isRound ? "rounded-full" : "rounded-xl"} overflow-hidden border border-white/10 relative ${className}`}
		>
			{/* Loading shimmer */}
			{imgState === "loading" && (
				<div className="absolute inset-0 bg-white/5 animate-pulse" />
			)}

			<motion.img
				src={url}
				alt={entityName}
				className="w-full h-full object-cover"
				loading="lazy"
				initial={{ opacity: 0 }}
				animate={{ opacity: imgState === "loaded" ? 1 : 0 }}
				transition={{ duration: 0.3 }}
				onLoad={() => setImgState("loaded")}
				onError={() => {
					setImgState("error");
					setUseFallback(true);
				}}
			/>
		</div>
	);
}
