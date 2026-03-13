"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 64, height: 64 },
    xl: { width: 120, height: 120 },
  };

  const { width, height } = sizes[size];

  // Since the provided logo.png has both icon and text, 
  // we'll use object-fit to focus on the icon part if showText is false,
  // or just show the whole thing.
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative" style={{ width, height }}>
        <Image
          src="/logo.png"
          alt="Credovia Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
