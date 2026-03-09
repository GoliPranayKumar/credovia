"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, ShieldCheck, Search, LayoutDashboard, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

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
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Credo<span className="text-primary">via</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            if (item.protected && !user) return null;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href="/dashboard" 
              className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[14px] font-black text-white shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all border-2 border-white/10"
            >
              {user.name?.[0] || "U"}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
