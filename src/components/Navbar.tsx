"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Trophy, 
  ChevronDown,
  Menu,
  X,
  Edit3,
  LogOut,
  Bell,
  Zap
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, protected: true },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none p-4 md:p-6">
      <nav 
        className={cn(
          "w-full max-w-7xl pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-between",
          scrolled 
            ? "glass rounded-[2rem] md:rounded-[2.5rem] px-4 md:px-10 py-3 md:py-4 shadow-2xl border border-white/10 bg-white/95 dark:bg-black/90 backdrop-blur-2xl"
            : "px-2 py-4"
        )}
      >
        {/* Left: Branding with Pulse */}
        <Link href="/" className="flex items-center gap-3 group transition-all hover:scale-105 active:scale-95 shrink-0 relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full animate-pulse" />
          <img 
            src="/logo.png" 
            alt="Credovia Logo" 
            className={cn(
              "transition-all duration-700 object-contain relative z-10",
              scrolled ? "h-10 md:h-12" : "h-12 md:h-20"
            )}
          />
          {!scrolled && (
             <div className="hidden lg:flex flex-col -space-y-1">
                <span className="text-lg font-black tracking-tighter text-foreground">CREDOVIA</span>
                <span className="text-[8px] font-black text-primary tracking-[0.5em] uppercase">Protocol</span>
             </div>
          )}
        </Link>

        {/* Center: Animated Nav Selection */}
        <div className="hidden md:flex items-center p-1.5 bg-neutral-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-inner">
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-7 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 group",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-neutral-800 rounded-full shadow-lg border border-white/10"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <Icon className={cn("w-3.5 h-3.5 relative z-10 transition-transform", isActive ? "scale-110" : "group-hover:translate-y-[-1px]")} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-2 md:gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Protocol Sync</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <NotificationsPanel userId={user.$id} />
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 pl-2 md:pl-5 bg-neutral-900/80 border border-white/10 rounded-full hover:bg-neutral-800 transition-all active:scale-95 shadow-xl group border-l-primary/30"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/90 mr-2 hidden lg:block">
                    {user.name?.split(' ')[0]}
                  </span>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-xs font-black text-white border-2 border-white shadow-lg overflow-hidden relative">
                     <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                     {profile?.avatar ? (
                       <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                       (profile?.name || user.name || "U")[0]
                     )}
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground mr-2 transition-transform hidden sm:block", showDropdown && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-72 rounded-[2.5rem] bg-neutral-900/95 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-3 z-10"
                    >
                      <div className="p-6 bg-white/5 rounded-3xl mb-2 border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="p-2 bg-primary/20 rounded-xl">
                              <Zap className="w-4 h-4 text-primary" />
                           </div>
                           <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Identity Verified</span>
                        </div>
                        <p className="text-sm font-black text-foreground">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold opacity-60 italic">{user.email}</p>
                      </div>

                      <div className="space-y-1">
                        <Link 
                          href="/dashboard?edit=true"
                          className="flex items-center justify-between w-full px-5 py-3.5 rounded-2xl hover:bg-white/5 text-foreground transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Edit3 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Protocol Settings</span>
                          </div>
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-30" />
                        </Link>

                        <button
                          onClick={logout}
                          className="flex items-center justify-between w-full px-5 py-3.5 rounded-2xl hover:bg-red-500/10 text-red-400 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <LogOut className="w-4 h-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-4 bg-primary text-white px-8 py-3.5 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
              <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em]">Initiate Access</span>
              <Zap className="w-4 h-4 relative z-10 animate-pulse text-blue-200" />
            </Link>
          )}

          {/* Mobile Orchestration */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-white/10 transition-all"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[150] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[380px] bg-neutral-900 z-[160] border-l border-white/10 shadow-2xl md:hidden flex flex-col p-8 rounded-l-[3rem]"
            >
              <div className="flex items-center justify-between mb-12">
                 <img src="/logo.png" alt="Logo" className="h-10 mix-blend-multiply brightness-110" />
                 <button onClick={() => setShowMobileMenu(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="space-y-4 flex-1">
                {navItems.map((item) => {
                  if (item.protected && !user) return null;
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={cn(
                        "flex items-center justify-between p-6 rounded-[2rem] transition-all border",
                        isActive 
                          ? "bg-primary border-primary text-white shadow-2xl shadow-primary/20" 
                          : "bg-white/5 border-white/5 text-foreground hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-center gap-5">
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-black uppercase tracking-[0.2em]">{item.name}</span>
                      </div>
                      <Zap className={cn("w-4 h-4", isActive ? "text-blue-200" : "opacity-0")} />
                    </Link>
                  );
                })}
              </div>

              <div className="pt-8 mt-auto border-t border-white/10">
                 {user ? (
                   <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-xl font-black text-white shadow-xl">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-base font-black tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Protocol Master</p>
                        </div>
                      </div>
                      <button 
                        onClick={logout}
                        className="w-full py-5 bg-red-500/10 text-red-400 font-black uppercase tracking-widest text-xs rounded-3xl border border-red-500/20"
                      >
                        Disconnect Sync
                      </button>
                   </div>
                 ) : (
                   <Link 
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center gap-3 w-full py-6 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-[2.5rem] shadow-2xl shadow-primary/40"
                   >
                     Initiate Protocol <Zap className="w-4 h-4 animate-pulse" />
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

