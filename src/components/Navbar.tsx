"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, 
  Search, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  Trophy, 
  User, 
  LogOut, 
  Edit3, 
  ChevronDown,
  Menu,
  X 
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll for premium floating effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown/menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setShowDropdown(false);
    setShowMobileMenu(false);
  }, [pathname]);

  const navItems = [
    { name: "Search", href: "/search", icon: Search },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, protected: true },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none p-4 md:p-6">
      <nav 
        className={cn(
          "w-full max-w-7xl pointer-events-auto transition-all duration-500 ease-in-out flex items-center justify-between",
          scrolled 
            ? "glass rounded-3xl md:rounded-[2.5rem] px-5 md:px-8 py-2.5 md:py-3 shadow-2xl shadow-primary/10 border border-white/20 dark:border-white/10 blur-sm-0 bg-white/70 dark:bg-card/70"
            : "px-2 py-4 border-b border-transparent"
        )}
      >
        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95 shrink-0">
          <img 
            src="/logo.png" 
            alt="Credovia Logo" 
            className={cn(
              "transition-all duration-500 object-contain mix-blend-multiply brightness-110",
              scrolled ? "h-9 md:h-11" : "h-11 md:h-16"
            )}
          />
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/30 p-1 rounded-2xl border border-border/40">
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-xl",
                  isActive 
                    ? "text-primary bg-white dark:bg-card shadow-sm border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-card/50"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 transition-transform", isActive && "scale-110")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-2xl border border-border/40">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-9 h-9 rounded-xl hover:bg-white dark:hover:bg-card flex items-center justify-center transition-all active:scale-90 overflow-hidden group shadow-none hover:shadow-sm"
              aria-label="Toggle theme"
            >
              <Sun className={cn(
                "w-4 h-4 text-amber-500 absolute transition-all duration-300 group-hover:rotate-12",
                theme === "dark" ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
              )} />
              <Moon className={cn(
                "w-4 h-4 text-violet-400 absolute transition-all duration-300 group-hover:-rotate-12",
                theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
              )} />
            </button>

            {/* Notifications */}
            {user && (
              <div className="hidden sm:block">
                <NotificationsPanel userId={user.$id} />
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-border/50 mx-1 hidden md:block" />

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 pl-2 md:pl-3 rounded-full border border-border/60 bg-white/50 hover:bg-white transition-all active:scale-95 shadow-sm group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-1 hidden lg:block">
                  {user.name?.split(' ')[0]}
                </span>
                <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-[10px] md:text-[12px] font-black text-white border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                  {(profile?.name || user.name || "U")[0]}
                </div>
                <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform hidden sm:block", showDropdown && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-64 rounded-3xl glass border border-border shadow-2xl p-2 z-[60]"
                  >
                    <div className="px-4 py-4 border-b border-border/50 mb-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Protocol Identity</p>
                      <p className="text-sm font-black text-foreground truncate">{user.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground truncate opacity-70 tracking-tight">{user.email}</p>
                    </div>

                    <div className="p-1 space-y-1">
                      <Link 
                        href="/dashboard?edit=true"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl hover:bg-primary/10 text-foreground transition-colors group"
                      >
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Edit Profile</span>
                      </Link>

                      <Link 
                        href="/dashboard"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl hover:bg-secondary text-foreground transition-colors group"
                      >
                        <div className="p-2 rounded-xl bg-secondary text-muted-foreground group-hover:bg-foreground group-hover:text-white transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Dashboard</span>
                      </Link>

                      <div className="h-px bg-border/50 my-1 mx-2" />

                      <button
                        onClick={() => {
                          logout();
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl hover:bg-red-500/10 text-red-500 transition-colors group"
                      >
                        <div className="p-2 rounded-xl bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Disconnect</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all"
            >
              Get Started
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden w-10 h-10 rounded-2xl border border-border/60 bg-white/50 flex items-center justify-center text-foreground active:scale-90 transition-transform"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Uses same logic as before but with refined styling) */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden pointer-events-auto"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-white dark:bg-card z-50 border-l border-border shadow-2xl md:hidden flex flex-col pointer-events-auto overflow-hidden rounded-l-[2.5rem]"
            >
              <div className="p-8 flex items-center justify-between border-b border-border/50">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol</span>
                   <span className="text-lg font-black text-foreground">Navigation</span>
                 </div>
                 <button onClick={() => setShowMobileMenu(false)} className="w-10 h-10 flex items-center justify-center bg-secondary/50 hover:bg-secondary rounded-2xl transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6 flex-1 space-y-3">
                {navItems.map((item) => {
                  if (item.protected && !user) return null;
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 px-5 py-5 rounded-3xl transition-all font-black uppercase tracking-widest text-xs",
                        isActive 
                          ? "bg-primary text-white shadow-xl shadow-primary/20" 
                          : "text-foreground hover:bg-secondary border border-transparent hover:border-border/50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-8 border-t border-border/50 bg-secondary/20">
                 {user ? (
                   <div className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-card border border-border/50">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg">
                        {user.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black truncate">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-bold">Authenticated User</p>
                      </div>
                   </div>
                 ) : (
                   <Link 
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-3xl shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
                   >
                     Login to Protocol <ArrowRight className="w-4 h-4" />
                   </Link>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fixed arrow right icon helper missing in original imports but used in mobile footer
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
