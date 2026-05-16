import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { SeedProvider } from "./components/SeedProvider";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";

// ── Route-level code splitting ──
const LandingPage = lazy(() =>
	import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
	import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
	import("./pages/SignupPage").then((m) => ({ default: m.SignupPage })),
);
const DashboardPage = lazy(() =>
	import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const PropsAnalyzerPage = lazy(() =>
	import("./pages/PropsAnalyzerPage").then((m) => ({
		default: m.PropsAnalyzerPage,
	})),
);
const AIChatPage = lazy(() =>
	import("./pages/AIChatPage").then((m) => ({ default: m.AIChatPage })),
);
const PickBuilderPage = lazy(() =>
	import("./pages/PickBuilderPage").then((m) => ({
		default: m.PickBuilderPage,
	})),
);
const MyPicksPage = lazy(() =>
	import("./pages/MyPicksPage").then((m) => ({ default: m.MyPicksPage })),
);
const ResultsPage = lazy(() =>
	import("./pages/ResultsPage").then((m) => ({ default: m.ResultsPage })),
);
const ModelLabPage = lazy(() =>
	import("./pages/ModelLabPage").then((m) => ({ default: m.ModelLabPage })),
);
const PlayerIntelPage = lazy(() =>
	import("./pages/PlayerIntelPage").then((m) => ({
		default: m.PlayerIntelPage,
	})),
);
const BankrollPage = lazy(() =>
	import("./pages/BankrollPage").then((m) => ({ default: m.BankrollPage })),
);
const LeaderboardPage = lazy(() =>
	import("./pages/LeaderboardPage").then((m) => ({
		default: m.LeaderboardPage,
	})),
);
const SettingsPage = lazy(() =>
	import("./pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const GameDetailPage = lazy(() =>
	import("./pages/GameDetailPage").then((m) => ({ default: m.GameDetailPage })),
);
const DataSourcesPage = lazy(() => import("./pages/DataSourcesPage"));
const ImportPage = lazy(() => import("./pages/ImportPage"));

function PageLoading() {
	return (
		<div className="flex items-center justify-center min-h-[40vh]">
			<div className="flex flex-col items-center gap-3">
				<div className="size-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
				<span className="text-xs text-muted-foreground">Loading…</span>
			</div>
		</div>
	);
}

function App() {
	return (
		<ErrorBoundary>
			<ThemeProvider defaultTheme="dark" switchable={false}>
				<SeedProvider />
				<Toaster />
				<Suspense fallback={<PageLoading />}>
					<Routes>
						<Route element={<PublicLayout />}>
							<Route path="/" element={<LandingPage />} />
							<Route element={<PublicOnlyRoute />}>
								<Route path="/login" element={<LoginPage />} />
								<Route path="/signup" element={<SignupPage />} />
							</Route>
						</Route>

						<Route element={<ProtectedRoute />}>
							<Route element={<AppLayout />}>
								<Route path="/dashboard" element={<DashboardPage />} />
								<Route path="/props" element={<PropsAnalyzerPage />} />
								<Route path="/chat" element={<AIChatPage />} />
								<Route path="/builder" element={<PickBuilderPage />} />
								<Route path="/my-picks" element={<MyPicksPage />} />
								<Route path="/results" element={<ResultsPage />} />
								<Route path="/model-lab" element={<ModelLabPage />} />
								<Route path="/players" element={<PlayerIntelPage />} />
								<Route path="/bankroll" element={<BankrollPage />} />
								<Route path="/leaderboard" element={<LeaderboardPage />} />
								<Route path="/settings" element={<SettingsPage />} />
								<Route path="/game/:gameId" element={<GameDetailPage />} />
								<Route path="/data-sources" element={<DataSourcesPage />} />
								<Route path="/import" element={<ImportPage />} />
							</Route>
						</Route>

						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</Suspense>
			</ThemeProvider>
		</ErrorBoundary>
	);
}

export default App;
