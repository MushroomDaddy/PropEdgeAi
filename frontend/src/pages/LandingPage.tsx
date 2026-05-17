import { useEffect, useState } from "react";
import { supabase } from "../lib/api";
import {
	ArrowRight,
	Bot,
	ChevronRight,
	LineChart,
	Shield,
	ShoppingCart,
	Target,
	TrendingUp,
	Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingPage() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setIsAuthenticated(!!data.session);
			setIsLoading(false);
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setIsAuthenticated(!!session);
		});
		return () => subscription.unsubscribe();
	}, []);

	return (
		<div className="flex-1 flex flex-col overflow-hidden bg-[#0A0E17]">
			{/* Hero */}
			<section className="relative flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-32 overflow-hidden">
				{/* Background effects */}
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF88]/5 rounded-full blur-[128px]" />
					<div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D4FF]/5 rounded-full blur-[128px]" />
					<div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
				</div>

				<div className="max-w-5xl mx-auto text-center space-y-8">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00FF88]/20 bg-[#00FF88]/5 text-xs font-medium text-[#00FF88]">
						<Zap className="size-3" />
						AI-Powered Edge Detection
						<ChevronRight className="size-3" />
					</div>

					{/* Headline */}
					<h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]">
						<span className="text-white">Find Your</span>
						<br />
						<span className="bg-gradient-to-r from-[#00FF88] via-[#00D4FF] to-[#A855F7] bg-clip-text text-transparent">
							Winning Edge
						</span>
					</h1>

					{/* Subheadline */}
					<p className="text-lg md:text-xl text-[#7B8BA8] max-w-2xl mx-auto leading-relaxed">
						The ultimate sports analyst for PrizePicks, Underdog, Sleeper &
						more. AI-driven projections, demo edge estimates, and optimized
						entries — all in one platform.
					</p>

					{/* CTA */}
					{!isAuthenticated && !isLoading && (
						<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
							<Button
								size="lg"
								className="text-base h-12 px-8 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E17] font-bold rounded-lg glow-green"
								asChild
							>
								<Link to="/signup">
									Start Finding Edges
									<ArrowRight className="size-4 ml-1" />
								</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="text-base h-12 px-8 border-[#1E293B] text-[#C8D0E0] hover:bg-[#1A2236] hover:text-white rounded-lg"
								asChild
							>
								<Link to="/login">Sign In</Link>
							</Button>
						</div>
					)}
					{isAuthenticated && (
						<Button
							size="lg"
							className="text-base h-12 px-8 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E17] font-bold rounded-lg glow-green"
							asChild
						>
							<Link to="/dashboard">
								Go to Dashboard
								<ArrowRight className="size-4 ml-1" />
							</Link>
						</Button>
					)}

					{/* Stats bar */}
					<div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-sm">
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-[#00FF88] animate-pulse" />
							<span className="text-[#7B8BA8]">Live Props</span>
							<span className="font-bold text-white">847</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-[#00D4FF]" />
							<span className="text-[#7B8BA8]">Avg Edge</span>
							<span className="font-bold text-[#00FF88]">+6.2%</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-[#A855F7]" />
							<span className="text-[#7B8BA8]">Hit Rate</span>
							<span className="font-bold text-white">67.4%</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-[#FFB800]" />
							<span className="text-[#7B8BA8]">Sports</span>
							<span className="font-bold text-white">8+</span>
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="px-4 py-20 relative">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
							Every Tool You Need
						</h2>
						<p className="text-[#7B8BA8] text-lg max-w-xl mx-auto">
							From projection aggregation to optimized entries — compare
							opportunities across platforms.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
						{[
							{
								icon: TrendingUp,
								title: "Edge Detection",
								desc: "Real-time edge % and +EV calculations across all platforms. See where the value is before anyone else.",
								color: "#00FF88",
							},
							{
								icon: Bot,
								title: "AI Analyst Chat",
								desc: '"Best NBA overs tonight?" — ask anything and get data-backed answers with cited projections.',
								color: "#00D4FF",
							},
							{
								icon: ShoppingCart,
								title: "Pick Builder",
								desc: "Build optimized entries for PrizePicks, Underdog, and more. Auto-correlation warnings included.",
								color: "#A855F7",
							},
							{
								icon: LineChart,
								title: "Projection Aggregation",
								desc: "Compare projections from FantasyLabs, Rotowire, NumberFire, ESPN, and more — side by side.",
								color: "#FFB800",
							},
							{
								icon: Target,
								title: "Performance Tracker",
								desc: "Track every pick, win rate, ROI, and streaks. Know exactly where you're making money.",
								color: "#FF4466",
							},
							{
								icon: Shield,
								title: "Multi-Sport Coverage",
								desc: "NFL, NBA, MLB, NHL, CFB, Soccer, Tennis, Esports — all under one roof with full analysis.",
								color: "#00FF88",
							},
						].map((f) => (
							<div
								key={f.title}
								className="group relative p-6 rounded-xl bg-[#111827]/80 border border-[#1E293B] hover:border-[#1E293B]/80 transition-all duration-300"
							>
								<div
									className="size-10 rounded-lg flex items-center justify-center mb-4"
									style={{ backgroundColor: `${f.color}15` }}
								>
									<f.icon className="size-5" style={{ color: f.color }} />
								</div>
								<h3 className="text-lg font-semibold text-white mb-2">
									{f.title}
								</h3>
								<p className="text-sm text-[#7B8BA8] leading-relaxed">
									{f.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Platform logos */}
			<section className="px-4 py-16 border-t border-[#1E293B]">
				<div className="max-w-4xl mx-auto text-center">
					<p className="text-sm text-[#7B8BA8] mb-8 uppercase tracking-wider font-medium">
						Supported Platforms
					</p>
					<div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
						{[
							"PrizePicks",
							"Underdog",
							"Sleeper",
							"DraftKings Pick6",
							"Kalshi",
						].map((p) => (
							<div
								key={p}
								className="text-[#4B5A78] font-bold text-lg hover:text-[#7B8BA8] transition-colors"
							>
								{p}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer CTA */}
			<section className="px-4 py-20">
				<div className="max-w-3xl mx-auto text-center">
					<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
						Ready to Find Your Edge?
					</h2>
					<p className="text-[#7B8BA8] text-lg mb-8">
						Join thousands of sports analytics users using AI to compare
						opportunities across platforms.
					</p>
					{!isAuthenticated && !isLoading && (
						<Button
							size="lg"
							className="text-base h-12 px-8 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0A0E17] font-bold rounded-lg glow-green"
							asChild
						>
							<Link to="/signup">
								Get Started Free
								<ArrowRight className="size-4 ml-1" />
							</Link>
						</Button>
					)}
				</div>
			</section>

			{/* Footer */}
			<footer className="px-4 py-8 border-t border-[#1E293B]">
				<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Zap className="size-4 text-[#00FF88]" />
						<span className="font-bold bg-gradient-to-r from-[#00FF88] to-[#00D4FF] bg-clip-text text-transparent">
							PropEdge AI
						</span>
					</div>
					<p className="text-sm text-[#4B5A78]">
						© 2026 PropEdge AI. For entertainment purposes only.
					</p>
				</div>
			</footer>
		</div>
	);
}
