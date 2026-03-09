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
      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)]",
            score >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" :
            score >= 60 ? "bg-gradient-to-r from-blue-500 to-indigo-400" :
            score >= 40 ? "bg-gradient-to-r from-yellow-500 to-orange-400" :
            "bg-gradient-to-r from-red-500 to-pink-500"
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
    <div className="h-[280px] w-full bg-secondary/10 rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
          <Radar
            name="Credibility"
            dataKey="A"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreBarComparison({ breakdown }: { breakdown: any }) {
  const data = [
    { name: 'Crypto', current: breakdown.crypto, max: 40 },
    { name: 'GitHub', current: breakdown.github, max: 25 },
    { name: 'Identity', current: breakdown.identity, max: 10 },
    { name: 'Domain', current: breakdown.domain, max: 10 },
    { name: 'Social', current: breakdown.behavior, max: 10 },
    { name: 'Peer', current: breakdown.peer, max: 5 },
  ].sort((a, b) => b.current - a.current);

  return (
    <div className="h-[250px] w-full bg-secondary/10 rounded-[2.5rem] p-6 border border-white/5">
      <h5 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest">Efficiency Ranking</h5>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ left: -20 }}>
          <XAxis type="number" hide domain={[0, 40]} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
          />
          <Bar dataKey="current" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
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
    <div className="h-[200px] w-full bg-secondary/10 rounded-[2.5rem] p-6 border border-white/5">
      <h5 className="text-[10px] font-black uppercase text-muted-foreground mb-4 tracking-widest">Trust Index Projection</h5>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
          <Area type="monotone" dataKey="val" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
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
    <div className="flex flex-col items-center gap-3 p-5 rounded-[2.5rem] bg-secondary/10 border border-white/5 group hover:border-primary/30 transition-all cursor-default">
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
              <Cell fill="rgba(255,255,255,0.03)" stroke="none" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-white">
          {Math.round(percentage)}%
        </div>
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:text-white">
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
  const COLORS = ['#6366f1', 'rgba(255,255,255,0.03)'];

  return (
    <div className="h-[180px] w-[180px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-white leading-none tracking-tighter">{score}</span>
        <span className="text-[11px] text-primary uppercase font-black tracking-[0.2em] mt-1">Trust</span>
      </div>
    </div>
  );
}

export function ScoreBreakdownView({ breakdown }: { breakdown: any }) {
  const items = [
    { label: "On-Chain", value: breakdown.crypto, max: 40, color: "#3b82f6" },
    { label: "Dev Activity", value: breakdown.github, max: 25, color: "#a855f7" },
    { label: "Identity", value: breakdown.identity, max: 10, color: "#10b981" },
    { label: "Domain", value: breakdown.domain, max: 10, color: "#6366f1" },
    { label: "Behavior", value: breakdown.behavior, max: 10, color: "#f59e0b" },
    { label: "Endorsements", value: breakdown.peer, max: 5, color: "#ec4899" },
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
        <div className="bg-secondary/10 p-4 rounded-[2rem] border border-white/5">
          <ScoreRadarChart breakdown={breakdown} />
        </div>
        <div className="bg-secondary/10 p-4 rounded-[2rem] border border-white/5">
          <ScoreBarComparison breakdown={breakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-secondary/10 p-6 rounded-[2rem] border border-white/5">
          <TrustEvolutionChart />
        </div>
        <div className="bg-primary/5 rounded-[2rem] border border-primary/20 p-8 flex flex-col items-center justify-center text-center space-y-4">
           <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center shadow-inner">
              <Zap className="w-8 h-8 text-primary" />
           </div>
           <div className="space-y-1">
              <h4 className="text-xl font-black">AI Insight</h4>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Predicted Growth</p>
           </div>
           <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your consistency, your protocol rank is projected to increase by <strong>12%</strong> in the next 30 days.
           </p>
        </div>
      </div>
    </div>
  );
}
