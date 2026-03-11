"use client";

import { cn } from "@/lib/utils";
import { Github, Wallet, Globe, Linkedin, Check, X } from "lucide-react";

interface VerificationBadgesProps {
  profile: {
    github?: string;
    walletAddress?: string;
    portfolio?: string;
    linkedin?: string;
    [key: string]: any;
  };
  size?: "sm" | "md";
}

export function VerificationBadges({ profile, size = "md" }: VerificationBadgesProps) {
  const verifications = [
    {
      id: "github",
      label: "GitHub",
      icon: Github,
      verified: !!profile.github?.includes("github.com"),
      color: "text-violet-600",
      bgVerified: "bg-violet-500/10 border-violet-500/20",
      bgUnverified: "bg-muted/30 border-border/40",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: Wallet,
      verified: !!profile.walletAddress?.startsWith("0x"),
      color: "text-cyan-600",
      bgVerified: "bg-cyan-500/10 border-cyan-500/20",
      bgUnverified: "bg-muted/30 border-border/40",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Globe,
      verified: !!profile.portfolio?.startsWith("http"),
      color: "text-emerald-600",
      bgVerified: "bg-emerald-500/10 border-emerald-500/20",
      bgUnverified: "bg-muted/30 border-border/40",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      icon: Linkedin,
      verified: !!profile.linkedin?.includes("linkedin"),
      color: "text-blue-600",
      bgVerified: "bg-blue-500/10 border-blue-500/20",
      bgUnverified: "bg-muted/30 border-border/40",
    },
  ];

  const isSmall = size === "sm";

  return (
    <div className={cn("flex items-center", isSmall ? "gap-1.5" : "gap-2 flex-wrap")}>
      {verifications.map((v) => {
        const Icon = v.icon;
        return (
          <div
            key={v.id}
            title={`${v.label}: ${v.verified ? "Verified ✓" : "Not verified"}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border transition-all",
              v.verified ? v.bgVerified : v.bgUnverified,
              v.verified ? "" : "opacity-40",
              isSmall ? "px-2 py-0.5" : "px-3 py-1.5"
            )}
          >
            <Icon className={cn(
              v.verified ? v.color : "text-muted-foreground",
              isSmall ? "w-3 h-3" : "w-3.5 h-3.5"
            )} />
            {!isSmall && (
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider",
                v.verified ? v.color : "text-muted-foreground"
              )}>
                {v.label}
              </span>
            )}
            {v.verified ? (
              <Check className={cn(v.color, isSmall ? "w-2.5 h-2.5" : "w-3 h-3")} />
            ) : (
              <X className={cn("text-muted-foreground", isSmall ? "w-2.5 h-2.5" : "w-3 h-3")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
