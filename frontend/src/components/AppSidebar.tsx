
import { useEffect, useState } from "react";
import { supabase } from "../lib/api";
import {
  Bot,
  ClipboardCheck,
  Database,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShoppingCart,
  Target,
  Trophy,
  Upload,
  UserSearch,
  Wallet,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { motion } from "framer-motion";

import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/props", label: "Prop Analyzer", icon: Search },
  { href: "/chat", label: "AI Analyst", icon: Bot },
  { href: "/builder", label: "Pick Builder", icon: ShoppingCart },
];

const intelligenceNav = [
  { href: "/players", label: "Player Intel", icon: UserSearch },
  { href: "/results", label: "Results", icon: ClipboardCheck },
  { href: "/model-lab", label: "Model Lab", icon: FlaskConical },
];

const dataNav = [
  { href: "/data-sources", label: "Data Sources", icon: Database },
  { href: "/import", label: "Import", icon: Upload },
];

const trackingNav = [
  { href: "/my-picks", label: "My Picks", icon: Target },
  { href: "/bankroll", label: "Bankroll", icon: Wallet },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton 
        asChild 
        isActive={isActive}
        className={`relative group h-10 transition-all duration-200 ${isActive ? 'bg-primary/5 text-primary' : 'hover:bg-white/5'}`}
      >
        <Link to={href} onClick={() => setOpenMobile(false)}>
          <Icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
          <span className={`font-medium ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
            {label}
          </span>
          {isActive && (
            <motion.div 
              layoutId="active-pill"
              className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarNav() {
  const location = useLocation();

  return (
    <SidebarContent className="px-2 pt-4 scrollbar-thin">
      <SidebarGroup>
        <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-2">
          Operations
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {mainNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-4">
        <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-2">
          Intel & Science
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {intelligenceNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-4">
        <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-2">
          Tracking
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {trackingNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup className="mt-4">
        <SidebarGroupLabel className="px-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 font-bold mb-2">
          System
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {dataNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={location.pathname === item.href}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

function SidebarUserMenu() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string } } | null>(null);
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <SidebarFooter className="p-4 bg-white/[0.01] border-t border-white/[0.05]">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="hover:bg-white/5 transition-colors">
                <Avatar className="size-8 rounded-lg border border-white/10 shadow-lg">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400 text-sm font-bold">
                    {user?.user_metadata?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left min-w-0">
                  <span className="text-sm font-bold truncate text-foreground leading-none">
                    {user?.user_metadata?.name || "Premium User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate font-mono mt-1 opacity-60">
                    {user?.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="start"
              className="w-[--radix-dropdown-menu-trigger-width] glass-panel p-2 shadow-2xl"
            >
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/settings" onClick={() => setOpenMobile(false)} className="gap-3">
                  <Settings className="size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-3"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function SidebarHeaderContent() {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarHeader className="p-6 border-b border-white/[0.05] bg-[#0c0d0e]">
      <Link
        to="/dashboard"
        onClick={() => setOpenMobile(false)}
        className="flex items-center gap-3 font-black text-xl tracking-tighter"
      >
        <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
          <Zap className="size-5 text-white fill-current" />
        </div>
        <span className="text-white">
          PROP<span className="text-primary italic">EDGE</span>
        </span>
      </Link>
    </SidebarHeader>
  );
}

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-white/[0.05] bg-[#0c0d0e]">
      <SidebarHeaderContent />
      <SidebarNav />
      <SidebarUserMenu />
    </Sidebar>
  );
}
