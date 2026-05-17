// SeedProvider: no-op stub — Convex seed logic removed
// Previously seeded demo data via Convex; backend now handles seeding separately.
export function SeedProvider({ children }: { children?: React.ReactNode }) {
	return <>{children ?? null}</>;
}
