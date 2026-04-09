"use client";

import { ShieldCheck, TrendingUp, Award } from "lucide-react";

interface ShareScoreCardProps {
  name: string;
  score: number;
  scoreLabel: string;
  breakdown: {
    crypto: number;
    github: number;
    identity: number;
    domain: number;
    behavior: number;
    peer: number;
    leetcode: number;
  };
}

export function ShareScoreCard({ name, score, scoreLabel, breakdown }: ShareScoreCardProps) {
  const getScoreGradient = (s: number) => {
    if (s >= 80) return "linear-gradient(135deg, #10b981, #06b6d4)";
    if (s >= 60) return "linear-gradient(135deg, #8b5cf6, #06b6d4)";
    if (s >= 40) return "linear-gradient(135deg, #f59e0b, #f97316)";
    return "linear-gradient(135deg, #f43f5e, #e11d48)";
  };

  const topMetrics = [
    { label: "GitHub", value: breakdown.github, max: 35 },
    { label: "LeetCode", value: breakdown.leetcode, max: 30 },
    { label: "Web3", value: breakdown.crypto, max: 15 },
    { label: "LinkedIn", value: breakdown.identity, max: 10 },
    { label: "Domain", value: breakdown.domain, max: 10 },
  ];

  return (
    <div
      id="credovia-share-card"
      style={{
        width: "1200px",
        height: "630px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #0f0a1e 0%, #1a1035 40%, #0d1520 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        padding: "60px",
        color: "#ffffff",
      }}
    >
      {/* Background Glow Effects */}
      <div style={{ position: "absolute", top: "-80px", right: "100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)", filter: "blur(60px)" }} />
      <div style={{ position: "absolute", bottom: "-60px", left: "200px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%)", filter: "blur(50px)" }} />
      
      {/* Grid Lines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Left Side — Score */}
      <div style={{ flex: "0 0 340px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 10 }}>
        {/* Score Circle */}
        <div style={{
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: `conic-gradient(#ffffff ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 60px rgba(255,255,255,0.05), inset 0 0 30px rgba(0,0,0,0.5)",
        }}>
          <div style={{
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            backgroundColor: "#000000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)",
          }}>
            <span style={{ fontSize: "72px", fontWeight: 900, lineHeight: 1, color: "#ffffff" }}>
              {score}
            </span>
            <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginTop: "4px" }}>
              Trust Score
            </span>
          </div>
        </div>

        {/* Score Label */}
        <div style={{
          marginTop: "20px",
          padding: "8px 20px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          fontSize: "12px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "#ffffff",
        }}>
          {scoreLabel}
        </div>
      </div>

      {/* Right Side — Info */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "60px", position: "relative", zIndex: 10 }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
          <img 
            src="/logo.png" 
            alt="Credovia Logo" 
            style={{ height: "45px", width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }} 
          />
        </div>

        {/* Name */}
        <h1 style={{ fontSize: "44px", fontWeight: 900, lineHeight: 1.1, margin: "0 0 8px", letterSpacing: "-0.03em" }}>
          {name}
        </h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 32px" }}>
          Verified Digital Identity
        </p>

        {/* Metric Bars */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
          {topMetrics.map((m) => (
            <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)" }}>{m.label}</span>
                <span style={{ fontSize: "11px", fontWeight: 900, color: "#ffffff" }}>{m.value}/{m.max}</span>
              </div>
              <div style={{ height: "6px", borderRadius: "3px", backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(m.value / m.max) * 100}%`, borderRadius: "3px", backgroundColor: "#ffffff" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.6)" }}>
            <ShieldCheck style={{ width: "12px", height: "12px" }} />
            credovia.io
          </div>
          <div style={{ width: "1px", height: "12px", backgroundColor: "rgba(255,255,255,0.3)" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Protocol Verified
          </span>
        </div>
      </div>
    </div>
  );
}
