import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { Button } from "./ui/button";

export function Header() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	useEffect(() => {
		import("../lib/api").then(({ supabase }) => {
			supabase.auth.getSession().then(({ data }) => setIsAuthenticated(!!data.session));
		});
	}, []);
	const isLoading = false;
	const location = useLocation();

	const isAuthPage =
		location.pathname === "/login" || location.pathname === "/signup";

	return (
		<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
			<div className="container">
				<div className="flex h-16 items-center justify-between">
					<Link
						to="/"
						className="flex items-center gap-2.5 font-semibold text-lg hover:opacity-80 transition-opacity"
					>
						<div className="size-8 rounded-lg bg-primary flex items-center justify-center">
							<span className="text-primary-foreground font-bold text-sm">
								M
							</span>
						</div>
						<span className="hidden sm:inline">{APP_NAME}</span>
					</Link>

					<nav className="flex items-center gap-2">
						{isLoading ? null : isAuthenticated ? (
							<Button size="sm" asChild>
								<Link to="/dashboard">
									Open App
									<ArrowRight className="size-4" />
								</Link>
							</Button>
						) : (
							!isAuthPage && (
								<>
									<Button variant="ghost" size="sm" asChild>
										<Link to="/login">Sign In</Link>
									</Button>
									<Button size="sm" asChild>
										<Link to="/signup">Get Started</Link>
									</Button>
								</>
							)
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
