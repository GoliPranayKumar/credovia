"use client";

import { cn } from "@/lib/utils";
import { getScoreColor, getScoreLabel } from "@/lib/score";
import { ShieldCheck, TrendingUp, Zap, Award, BarChart3, Users } from "lucide-react";
import { motion } from "framer-motion";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const colorClass = getScoreColor(score);
  const label = getScoreLabel(score);

  const sizeClasses = {
    sm: "px-2 py-1 text-[10px]",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-2 font-bold rounded-full border shadow-sm",
      colorClass,
      sizeClasses[size]
    )}>
      <ShieldCheck className={cn(size === "sm" ? "w-3 h-3" : "w-5 h-5")} />
      <span>{score} - {label}</span>
    </div>
  );
}

export function ScoreProgress({ score }: { score: number }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Credibility Power</span>
        <span className="text-2xl font-black">{score}<span className="text-xs text-muted-foreground ml-1">/100</span></span>
      </div>
      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-border">
          <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            score >= 80 ? "bg-gradient-to-r from-emerald-500 via-cyan-400 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]" :
            score >= 60 ? "bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-400 shadow-[0_0_12px_rgba(139,92,246,0.4)]" :
            score >= 40 ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
            "bg-gradient-to-r from-rose-400 via-pink-400 to-red-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]"
          )}
        />
      </div>
    </div>
  );
}

import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid
} from 'recharts';

// Vibrant color palette for each metric
const METRIC_COLORS = {
  crypto:   { main: '#06b6d4', light: 'rgba(6,182,212,0.15)',  glow: 'rgba(6,182,212,0.08)' },   // Cyan
  github:   { main: '#8b5cf6', light: 'rgba(139,92,246,0.15)', glow: 'rgba(139,92,246,0.08)' },   // Violet
  identity: { main: '#10b981', light: 'rgba(16,185,129,0.15)', glow: 'rgba(16,185,129,0.08)' },   // Emerald
  domain:   { main: '#f59e0b', light: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.08)' },   // Amber
  behavior: { main: '#f43f5e', light: 'rgba(244,63,94,0.15)',  glow: 'rgba(244,63,94,0.08)' },    // Rose
  peer:     { main: '#3b82f6', light: 'rgba(59,130,246,0.15)', glow: 'rgba(59,130,246,0.08)' },   // Blue
};

export function ScoreRadarChart({ breakdown }: { breakdown: any }) {
  const data = [
    { subject: 'Crypto', A: breakdown.crypto, fullMark: 40 },
    { subject: 'GitHub', A: breakdown.github, fullMark: 25 },
    { subject: 'Identity', A: breakdown.identity, fullMark: 10 },
    { subject: 'Domain', A: breakdown.domain, fullMark: 10 },
    { subject: 'Behavior', A: breakdown.behavior, fullMark: 10 },
    { subject: 'Peer', A: breakdown.peer, fullMark: 5 },
  ];

  return (
    <div className="h-[280px] w-full bg-gradient-to-br from-violet-50/60 via-white to-cyan-50/40 rounded-[2.5rem] p-6 border border-violet-100/60 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-rose-400 opacity-60 group-hover:opacity-100 transition-opacity" />
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(139,92,246,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#6d28d9', fontSize: 10, fontWeight: 700 }} />
          <Radar
            name="Credibility"
            dataKey="A"
            stroke="#8b5cf6"
            fill="url(#radarGradient)"
            fillOpacity={0.6}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreBarComparison({ breakdown }: { breakdown: any }) {
  const colorMap: Record<string, string> = {
    'Crypto': METRIC_COLORS.crypto.main,
    'GitHub': METRIC_COLORS.github.main,
    'Identity': METRIC_COLORS.identity.main,
    'Domain': METRIC_COLORS.domain.main,
    'Social': METRIC_COLORS.behavior.main,
    'Peer': METRIC_COLORS.peer.main,
  };

  const data = [
    { name: 'Crypto', current: breakdown.crypto, max: 40 },
    { name: 'GitHub', current: breakdown.github, max: 25 },
    { name: 'Identity', current: breakdown.identity, max: 10 },
    { name: 'Domain', current: breakdown.domain, max: 10 },
    { name: 'Social', current: breakdown.behavior, max: 10 },
    { name: 'Peer', current: breakdown.peer, max: 5 },
  ].sort((a, b) => b.current - a.current);

  return (
    <div className="h-[250px] w-full bg-gradient-to-br from-rose-50/40 via-white to-amber-50/40 rounded-[2.5rem] p-6 border border-rose-100/50">
      <h5 className="text-[10px] font-black uppercase text-violet-900/60 mb-4 tracking-widest">Efficiency Ranking</h5>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ left: -20 }}>
          <XAxis type="number" hide domain={[0, 40]} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#6d28d9', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(139,92,246,0.04)' }}
            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', fontSize: '10px' }}
          />
          <Bar dataKey="current" radius={[0, 6, 6, 0]} barSize={14}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colorMap[entry.name] || '#8b5cf6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrustEvolutionChart() {
  const data = [
    { name: 'Jan', val: 45 },
    { name: 'Feb', val: 52 },
    { name: 'Mar', val: 48 },
    { name: 'Apr', val: 61 },
    { name: 'May', val: 59 },
    { name: 'Jun', val: 72 },
  ];

  return (
    <div className="h-[200px] w-full bg-gradient-to-br from-cyan-50/50 via-white to-violet-50/40 rounded-[2.5rem] p-6 border border-cyan-100/50">
      <h5 className="text-[10px] font-black uppercase text-violet-900/60 mb-4 tracking-widest">Trust Index Projection</h5>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
              <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', fontSize: '10px' }} />
          <Area type="monotone" dataKey="val" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ParameterGauge({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const percentage = (value / max) * 100;
  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: max - value },
  ];

  return (
    <div className="flex flex-col items-center gap-3 p-5 rounded-[2.5rem] bg-white border border-border/60 group hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/40 transition-all cursor-default">
      <div className="h-[75px] w-[75px] relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={37}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              <Cell fill={color} stroke="none" />
              <Cell fill="rgba(0,0,0,0.04)" stroke="none" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-foreground">
          {Math.round(percentage)}%
        </div>
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-[10px] font-black uppercase tracking-widest transition-colors group-hover:text-violet-600" style={{ color: `${color}cc` }}>
          {label}
        </p>
        <p className="text-[9px] font-mono text-muted-foreground opacity-50">
          {value}/{max} pts
        </p>
      </div>
    </div>
  );
}

export function ScoreGauge({ score }: { score: number }) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  // Dynamic gradient based on score
  const getGaugeColor = (s: number) => {
    if (s >= 80) return '#10b981'; // Emerald
    if (s >= 60) return '#8b5cf6'; // Violet
    if (s >= 40) return '#f59e0b'; // Amber
    return '#f43f5e';              // Rose
  };

  const gaugeColor = getGaugeColor(score);

  return (
    <div className="h-[180px] w-[180px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor={gaugeColor} />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill="url(#gaugeGradient)" stroke="none" />
            <Cell fill="rgba(0,0,0,0.04)" stroke="none" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-foreground leading-none tracking-tighter">{score}</span>
        <span className="text-[11px] uppercase font-black tracking-[0.2em] mt-1 bg-gradient-to-r from-cyan-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">Trust</span>
      </div>
    </div>
  );
}

export function ScoreBreakdownView({ breakdown }: { breakdown: any }) {
  const items = [
    { label: "On-Chain",      value: breakdown.crypto,   max: 40, color: METRIC_COLORS.crypto.main },
    { label: "Dev Activity",  value: breakdown.github,   max: 25, color: METRIC_COLORS.github.main },
    { label: "Identity",      value: breakdown.identity, max: 10, color: METRIC_COLORS.identity.main },
    { label: "Domain",        value: breakdown.domain,   max: 10, color: METRIC_COLORS.domain.main },
    { label: "Behavior",      value: breakdown.behavior, max: 10, color: METRIC_COLORS.behavior.main },
    { label: "Endorsements",  value: breakdown.peer,     max: 5,  color: METRIC_COLORS.peer.main },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <ParameterGauge 
            key={i}
            label={item.label}
            value={item.value}
            max={item.max}
            color={item.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-[2.5rem] border border-border shadow-sm">
          <ScoreRadarChart breakdown={breakdown} />
        </div>
        <div className="bg-white p-4 rounded-[2.5rem] border border-border shadow-sm">
          <ScoreBarComparison breakdown={breakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-6 rounded-[2.5rem] border border-border shadow-sm">
          <TrustEvolutionChart />
        </div>
        <div className="bg-gradient-to-br from-violet-50 via-cyan-50/30 to-emerald-50/30 rounded-[2.5rem] border border-violet-100 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-violet-100">
              <Zap className="w-8 h-8 text-violet-500" />
           </div>
           <div className="space-y-1">
              <h4 className="text-xl font-black bg-gradient-to-r from-violet-700 to-cyan-600 bg-clip-text text-transparent">AI Insight</h4>
              <p className="text-[10px] text-violet-900/60 uppercase tracking-widest font-black">Predicted Growth</p>
           </div>
           <p className="text-xs text-violet-800 leading-relaxed">
              Based on your consistency, your protocol rank is projected to increase by <strong>12%</strong> in the next 30 days.
           </p>
        </div>
      </div>
    </div>


  );
}
