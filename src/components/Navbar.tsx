"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Search, LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    account.get()
      .then(setUser)
      .catch(() => setUser(null));
  }, [pathname]);

  const navItems = [
    { name: "Search", href: "/search", icon: Search },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, protected: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-violet-500/15">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Credo<span className="text-violet-600">via</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-foreground">
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-violet-600",
                  pathname === item.href ? "text-violet-600" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-all active:scale-90 group overflow-hidden"
            aria-label="Toggle theme"
          >
            <Sun className={cn(
              "w-[18px] h-[18px] text-amber-500 absolute transition-all duration-300",
              theme === "dark" ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
            )} />
            <Moon className={cn(
              "w-[18px] h-[18px] text-violet-400 absolute transition-all duration-300",
              theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
            )} />
          </button>

          {user ? (
            <Link 
              href="/dashboard" 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-[14px] font-black text-white shadow-sm hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-gray-800"
            >
              {user.name?.[0] || "U"}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              Get Started
            </Link>
          )}
        </div>


      </div>
    </nav>
  );
}
