
import { Link, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { LayoutDashboard, Search, Bot, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#08090a]">
        <AppSidebar />
        <SidebarInset className="relative flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out">
          {/* Top Bar for Desktop/Mobile */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-6 md:h-14 lg:h-16 lg:px-8 bg-background/50 backdrop-blur-xl border-b border-white/5">
             <div className="flex items-center gap-4">
                <SidebarTrigger className="md:flex" />
                <div className="h-4 w-px bg-white/10 hidden md:block" />
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground opacity-50">Operational System</h2>
             </div>
             <div className="flex items-center gap-3">
                <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#f7f8f8]">Sync Active</span>
             </div>
          </header>

          <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
            <Outlet />
          </main>

          {/* Premium Mobile Bottom Navigation */}
          <MobileBottomNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function MobileBottomNav() {
  const location = useLocation();
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/props", icon: Search, label: "Analyzer" },
    { icon: Bot, href: "/chat", label: "Analyst", highlight: true },
    { href: "/builder", icon: Target, label: "Builder" },
    { href: "/players", icon: User, label: "Intel" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden">
      {/* Background with blur */}
      <div className="absolute inset-0 bg-[#0c0d0e]/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]" />
      
      <nav className="relative flex items-center justify-around h-20 px-4 px-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              to={item.href || '#'}
              className="relative flex flex-col items-center justify-center p-2 min-w-[64px]"
            >
              {item.highlight ? (
                <div className="absolute -top-10 flex flex-col items-center">
                   <div className="size-16 rounded-3xl bg-indigo-600 border-4 border-[#08090a] flex items-center justify-center shadow-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent group-active:opacity-50" />
                      <Icon className="size-7 text-white fill-current" />
                   </div>
                   <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-indigo-400">Analyst</span>
                </div>
              ) : (
                <>
                  <div className={cn(
                    "transition-all duration-300",
                    isActive ? "text-primary scale-110" : "text-muted-foreground opacity-40"
                  )}>
                    <Icon className="size-6" />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest mt-1 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground opacity-40"
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottom-nav-active"
                      className="absolute -bottom-1 size-1 rounded-full bg-primary"
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
