"use client";

import { cn } from "@/lib/utils";
import { getScoreColor, getScoreLabel } from "@/lib/score";
import { ShieldCheck, Zap, Award, Users, TrendingUp, Globe } from "lucide-react";
import { SiGithub, SiLeetcode, SiEthereum } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

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
      <img src="/logo.png" alt="logo" className={cn(size === "sm" ? "w-3 h-3" : "w-5 h-5", "object-contain")} />
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
            "h-full rounded-full shadow-[0_0_10px_rgba(37,99,235,0.1)]",
            score >= 80 ? "bg-gradient-to-r from-blue-600 to-blue-500" :
            score >= 60 ? "bg-gradient-to-r from-blue-500 to-blue-400" :
            score >= 40 ? "bg-gradient-to-r from-blue-400 to-blue-300" :
            "bg-gradient-to-r from-blue-300 to-blue-200"
          )}
        />
      </div>
    </div>
  );
}

export function ScoreRadarChart({ breakdown }: { breakdown: any }) {
  const data = [
    { subject: 'On-Chain', A: breakdown.crypto, fullMark: 15 },
    { subject: 'GitHub Activity', A: breakdown.github, fullMark: 35 },
    { subject: 'LinkedIn', A: breakdown.identity, fullMark: 10 },
    { subject: 'LeetCode', A: breakdown.leetcode, fullMark: 30 },
    { subject: 'Domain', A: breakdown.domain, fullMark: 10 },
  ];

  return (
    <div className="h-[240px] md:h-[280px] w-full min-w-0 bg-transparent rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 border border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(79,70,229,0.15)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#818cf8', fontSize: 9, fontWeight: 700 }} />
          <Radar
            name="Credibility"
            dataKey="A"
            stroke="#6366f1"
            fill="#4f46e5"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreBarComparison({ breakdown }: { breakdown: any }) {
  const data = [
    { name: 'On-Chain', current: breakdown.crypto, max: 15 },
    { name: 'GitHub', current: breakdown.github, max: 35 },
    { name: 'LinkedIn', current: breakdown.identity, max: 10 },
    { name: 'LeetCode', current: breakdown.leetcode, max: 30 },
    { name: 'Domain', current: breakdown.domain, max: 10 },
  ].sort((a, b) => (a.current / a.max) - (b.current / b.max)); // Sort by efficiency percentage

  return (
    <div className="h-[210px] md:h-[250px] w-full min-w-0 bg-transparent rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 border border-white/10">
      <h5 className="text-[10px] font-black uppercase text-indigo-400 mb-4 tracking-widest">Efficiency Ranking</h5>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart layout="vertical" data={data} margin={{ left: 15, right: 30 }}>
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: '#818cf8', fontSize: 9, fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false}
            width={70}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(79,70,229,0.05)' }}
            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '12px', fontSize: '10px', color: '#818cf8' }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="current" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12} />
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
    <div className="h-[180px] md:h-[200px] w-full min-w-0 bg-transparent rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 border border-white/10">
      <h5 className="text-[10px] font-black uppercase text-blue-400 mb-4 tracking-widest">Trust Index Projection</h5>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
             contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px', fontSize: '10px', color: '#60a5fa' }}
             itemStyle={{ color: '#fff' }}
          />
          <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ParameterGauge({ label, value, max, color, icon: Icon }: { label: string, value: number, max: number, color: string, icon: any }) {
  const percentage = (value / max) * 100;
  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: max - value },
  ];

  return (
    <div className="flex flex-col items-center gap-3 p-3 sm:p-5 rounded-[2rem] bg-neutral-900/50 border border-white/5 group hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transition-all cursor-default">
      <div className="h-[75px] w-[75px] relative shrink-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
              <Cell fill="rgba(255,255,255,0.05)" stroke="none" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-3.5 h-3.5 mb-0.5 opacity-90" style={{ color }} />
          <span className="font-black text-[10px] text-white leading-none">{Math.round(percentage)}%</span>
        </div>
      </div>
      <div className="text-center space-y-0.5">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest transition-colors group-hover:text-white">
          {label}
        </p>
        <p className="text-[9px] font-mono text-neutral-500">
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

  return (
    <div className="h-[140px] w-[140px] md:h-[180px] md:w-[180px] relative min-w-0 min-h-0">
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
            <Cell fill="#2563eb" stroke="none" />
            <Cell fill="rgba(37,99,235,0.03)" stroke="none" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-foreground leading-none tracking-tighter">{score}</span>
        <span className="text-[11px] text-blue-900/60 uppercase font-black tracking-[0.2em] mt-1">Trust</span>
      </div>
    </div>
  );
}

export function ScoreBreakdownView({ breakdown }: { breakdown: any }) {
  const items = [
    { label: "On-Chain", value: breakdown.crypto, max: 15, color: "#8b5cf6", icon: SiEthereum },
    { label: "GitHub", value: breakdown.github, max: 35, color: "#3b82f6", icon: SiGithub },
    { label: "LinkedIn", value: breakdown.identity, max: 10, color: "#06b6d4", icon: FaLinkedin },
    { label: "LeetCode", value: breakdown.leetcode, max: 30, color: "#f59e0b", icon: SiLeetcode },
    { label: "Domain", value: breakdown.domain, max: 10, color: "#10b981", icon: Globe },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {items.map((item, i) => (
          <ParameterGauge 
            key={i}
            label={item.label}
            value={item.value}
            max={item.max}
            color={item.color}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-transparent p-4 rounded-[2.5rem] border border-white/10 shadow-sm">
          <ScoreRadarChart breakdown={breakdown} />
        </div>
        <div className="bg-transparent p-4 rounded-[2.5rem] border border-white/10 shadow-sm">
          <ScoreBarComparison breakdown={breakdown} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="md:col-span-2 bg-transparent p-4 sm:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-sm">
          <TrustEvolutionChart />
        </div>
        <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 rounded-[2rem] md:rounded-[2.5rem] border border-indigo-500/20 p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-sm group">
           <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shadow-inner border border-blue-500/20 group-hover:border-blue-400/40 transition-colors">
              <Zap className="w-8 h-8 text-blue-400" />
           </div>
           <div className="space-y-1">
              <h4 className="text-xl font-black text-indigo-50">AI Insight</h4>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">Predicted Growth</p>
           </div>
           <p className="text-xs text-indigo-200/80 leading-relaxed">
              Based on your consistency, your protocol rank is projected to increase by <strong className="text-cyan-400">12%</strong> in the next 30 days.
           </p>
        </div>
      </div>

    </div>
  );
}
