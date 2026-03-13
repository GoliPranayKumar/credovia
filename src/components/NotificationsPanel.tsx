"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, X, Trophy, Star, ThumbsUp, TrendingUp, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "review" | "badge" | "score" | "welcome";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const ICONS = {
  review: ThumbsUp,
  badge: Trophy,
  score: TrendingUp,
  welcome: Star,
};

const COLORS = {
  review: "text-cyan-500 bg-cyan-500/10",
  badge: "text-amber-500 bg-amber-500/10",
  score: "text-emerald-500 bg-emerald-500/10",
  welcome: "text-violet-500 bg-violet-500/10",
};

function getDefaultNotifs(): Notification[] {
  return [
    {
      id: "w1",
      type: "welcome",
      title: "Welcome to Credovia!",
      message: "Your digital trust profile is live. Start linking accounts to grow your score.",
      time: "Just now",
      read: false,
    },
    {
      id: "s1",
      type: "score",
      title: "Score Calculated",
      message: "Your credibility score has been calculated based on your profile data.",
      time: "Today",
      read: false,
    },
  ];
}

export function NotificationsPanel({ userId }: { userId?: string }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Load from storage
  useEffect(() => {
    const key = `credovia-notifs-${userId || "guest"}`;
    const stored = localStorage.getItem(key);
    let initialNotifs: Notification[] = [];
    
    if (stored) {
      try {
        initialNotifs = JSON.parse(stored);
      } catch (e) {
        initialNotifs = getDefaultNotifs();
      }
    } else {
      initialNotifs = getDefaultNotifs();
    }

    // De-duplicate on load (in case previous errors left trash in storage)
    const uniqueMap = new Map();
    initialNotifs.forEach(n => {
      if (!uniqueMap.has(n.id)) uniqueMap.set(n.id, n);
    });
    setNotifs(Array.from(uniqueMap.values()));
  }, [userId]);

  // Save to storage
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const key = `credovia-notifs-${userId || "guest"}`;
    localStorage.setItem(key, JSON.stringify(notifs));
  }, [notifs, userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs(prev => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotif = (id: string) => {
    setNotifs(prev => prev.filter((n) => n.id !== id));
  };

  // Expose helper globally
  useEffect(() => {
    (window as any).__addCredoviaNotif = (notif: Omit<Notification, "id" | "read" | "time">) => {
      const newNotif: Notification = {
        ...notif,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        read: false,
        time: "Just now",
      };
      
      setNotifs((prev) => {
        // Double check for duplicates before adding
        if (prev.some(p => p.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
    };
  }, [userId]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-10 h-10 rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-all active:scale-90"
        aria-label="Notifications"
      >
        <Bell className={cn("w-[18px] h-[18px] transition-colors", open ? "text-violet-500" : "text-muted-foreground")} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 md:-right-2 top-14 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-card rounded-2xl border border-border shadow-2xl shadow-violet-500/10 z-50 overflow-hidden"
            style={{ maxWidth: "320px", left: "auto", right: "0" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-black text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] font-bold text-violet-600 hover:text-violet-800 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50">
              {notifs.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No notifications yet!
                </div>
              ) : (
                notifs.map((n) => {
                  const Icon = ICONS[n.type];
                  const color = COLORS[n.type];
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors group",
                        !n.read ? "bg-violet-50/60 dark:bg-violet-500/5" : "bg-transparent"
                      )}
                    >
                      <div className={cn("mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0", color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-foreground">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{n.message}</p>
                        <p className="text-[9px] text-muted-foreground/50 mt-1 font-bold uppercase tracking-wider">{n.time}</p>
                      </div>
                      <button
                        onClick={() => dismissNotif(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded-lg"
                      >
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
