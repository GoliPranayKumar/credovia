"use client";

import { cn } from "@/lib/utils";
import { 
  Trophy, Star, Shield, Rocket, Users, Zap, 
  Crown, Target, CheckCircle, Lock
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  earned: boolean;
}

interface AchievementBadgesProps {
  score: number;
  profile: any;
  breakdown: {
    crypto: number;
    github: number;
    identity: number;
    domain: number;
    behavior: number;
    peer: number;
  };
}

export function AchievementBadges({ score, profile, breakdown }: AchievementBadgesProps) {
  const hasGithub = !!profile.github?.includes("github.com");
  const hasWallet = !!profile.walletAddress?.startsWith("0x");
  const hasPortfolio = !!profile.portfolio?.startsWith("http");
  const hasLinkedin = !!profile.linkedin?.includes("linkedin.com");

  const badges: Badge[] = [
    {
      id: "pioneer",
      name: "Pioneer",
      description: "Created a Credovia account",
      icon: Rocket,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
      glowColor: "shadow-violet-500/20",
      earned: true,
    },
    {
      id: "first-50",
      name: "Half Century",
      description: "Score reached 50+",
      icon: Target,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      glowColor: "shadow-cyan-500/20",
      earned: score >= 50,
    },
    {
      id: "social-proof",
      name: "Social Proof",
      description: "LinkedIn & GitHub linked",
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      glowColor: "shadow-blue-500/20",
      earned: hasGithub && hasLinkedin,
    },
    {
      id: "fully-verified",
      name: "Fully Verified",
      description: "All sources connected",
      icon: Shield,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      glowColor: "shadow-emerald-500/20",
      earned: hasGithub && hasWallet && hasPortfolio && hasLinkedin,
    },
    {
      id: "chain-master",
      name: "On-Chain Master",
      description: "Max wallet score (40/40)",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      glowColor: "shadow-amber-500/20",
      earned: breakdown.crypto >= 35,
    },
    {
      id: "top-10",
      name: "Top 10%",
      description: "Score reached 90+",
      icon: Crown,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      glowColor: "shadow-rose-500/20",
      earned: score >= 90,
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  // Confetti on badge unlock (detect new badge since last visit)
  useEffect(() => {
    const STORAGE_KEY = `credovia-badges-${profile.$id || "user"}`;
    const prev: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const nowEarned = badges.filter((b) => b.earned).map((b) => b.id);
    const newlyUnlocked = nowEarned.filter((id) => !prev.includes(id));

    if (newlyUnlocked.length > 0) {
      // Fire confetti
      const fire = (opts: confetti.Options) =>
        confetti({ ...opts, disableForReducedMotion: true });

      const fireConfetti = () => {
        fire({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],
        });
        fire({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],
        });
      };

      setTimeout(fireConfetti, 600);

      // Push notification for each new badge
      newlyUnlocked.forEach((id) => {
        const badge = badges.find((b) => b.id === id);
        if (badge && (window as any).__addCredoviaNotif) {
          (window as any).__addCredoviaNotif({
            type: "badge",
            title: `Badge Unlocked: ${badge.name}`,
            message: badge.description,
          });
        }
      });
    }

    // Always update stored state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nowEarned));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="p-8 rounded-[2.5rem] glass border-border bg-white shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-2xl font-black tracking-tight text-foreground">Achievements</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Milestones earned through verification and reputation building.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-black text-amber-600">{earnedCount}/{badges.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {badges.map((badge, i) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={cn(
                "relative flex flex-col items-center text-center p-5 rounded-[2rem] border transition-all cursor-default group",
                badge.earned
                  ? `${badge.bgColor} ${badge.borderColor} shadow-lg ${badge.glowColor} hover:scale-105`
                  : "bg-muted/30 border-border/40 opacity-40 grayscale"
              )}
            >
              {/* Glow ring for earned */}
              {badge.earned && (
                <div className={cn(
                  "absolute -inset-[1px] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity",
                  badge.bgColor
                )} style={{ filter: "blur(8px)" }} />
              )}

              <div className={cn(
                "relative w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border transition-transform group-hover:scale-110",
                badge.earned
                  ? `${badge.bgColor} ${badge.borderColor}`
                  : "bg-muted/50 border-border/30"
              )}>
                <Icon className={cn(
                  "w-6 h-6",
                  badge.earned ? badge.color : "text-muted-foreground/50"
                )} />
              </div>

              <h4 className={cn(
                "text-[10px] font-black uppercase tracking-wider mb-1",
                badge.earned ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {badge.name}
              </h4>

              <p className={cn(
                "text-[8px] leading-tight",
                badge.earned ? "text-muted-foreground" : "text-muted-foreground/30"
              )}>
                {badge.description}
              </p>

              {/* Status indicator */}
              <div className="absolute top-3 right-3">
                {badge.earned ? (
                  <CheckCircle className={cn("w-3.5 h-3.5", badge.color)} />
                ) : (
                  <Lock className="w-3 h-3 text-muted-foreground/30" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
