"use client";

import Link from "next/link";
import { ShieldCheck, Github, Linkedin, Globe, Search, Trophy } from "lucide-react";
import { SiEthereum, SiGithub, SiLeetcode } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { motion } from "framer-motion";
import { HeroSequence } from "@/components/HeroSequence";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { loginWithGithub } = useAuth();
  
  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-24 pb-8 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
        
        {/* Left Column - Text Content */}
        <div className="flex-1 space-y-8 text-center lg:text-left z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-foreground text-sm font-bold opacity-0 shadow-sm"
          >
            <Trophy className="w-4 h-4" />
            <span>The Gold Standard for Digital Reputation</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]"
          >
            Your Reputation in <br />
            <span>
              <span>A Single </span>
              <span className="text-primary">Number.</span>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground w-full max-w-2xl mx-auto lg:mx-0 leading-relaxed"
          >
            Verify your professional standing with our <strong>Weighted Credibility Model</strong>. 
            Connect your Web3 wallet, GitHub, and Google identity to generate a transparent, 0–100 trust score.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/20 transition-all hover:-translate-y-1 active:scale-95 text-lg"
            >
              Create Your Profile
            </Link>
            <Link 
              href="/search" 
              className="w-full sm:w-auto px-8 py-4 bg-secondary border border-border text-foreground font-bold rounded-2xl hover:bg-muted transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-lg shadow-sm"
            >
              <Search className="w-5 h-5 text-foreground" />
              Find Users
            </Link>
          </motion.div>
        </div>

        {/* Right Column - Hero Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex-1 w-full max-w-lg lg:max-w-xl relative flex justify-center items-center z-10"
        >
          <HeroSequence />
          
          {/* Decorative background blob for image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-3xl -z-10 rounded-full" />
        </motion.div>

        {/* Floating background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-20 w-full max-w-4xl opacity-5 blur-3xl pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white rounded-full" />
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[
          {
            title: "15% Web3 Activity",
            desc: "On-chain verification of wallet maturity and network transactions.",
            icon: SiEthereum,
          },
          {
            title: "35% GitHub",
            desc: "Quantitative analysis of open-source repositories and contribution regularity.",
            icon: SiGithub,
          },
          {
            title: "10% LinkedIn",
            desc: "Verification of your professional network identity and career standing.",
            icon: FaLinkedin,
          },
          {
            title: "30% LeetCode",
            desc: "Validation of algorithmic proficiency and problem-solving benchmarks.",
            icon: SiLeetcode,
          },
          {
             title: "10% Enterprise",
             desc: "Official authority verified via your institutional email domain ownership.",
             icon: Globe,
          }
        ].map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 md:p-8 rounded-3xl glass hover:border-white/20 transition-colors space-y-4 shadow-sm group border border-border"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 bg-secondary rounded-xl flex items-center justify-center text-foreground border border-border shadow-inner group-hover:scale-110 transition-transform`}>
               <f.icon className="w-6 h-6 md:w-7 md:h-7 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Engine Documentation Section */}
      <section className="pt-12 pb-8">
         <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
               <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg font-mono shadow-inner">ƒ</span>
                  Engine Calculations
               </h2>
               <p className="text-muted-foreground max-w-2xl text-lg mb-12">
                  Complete algorithmic transparency. Here is exactly how your raw platform parameters math out to your final 0-100 credibility ranking.
               </p>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 text-sm font-mono text-neutral-400">
                  <div className="space-y-3 p-5 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors">
                     <strong className="block text-blue-400 text-base">GitHub (35%)</strong>
                     <p className="leading-relaxed">Base presence (+7), max combined weighted score of Repositories (+7), Stars (+7), Longevity (+7), and Commit Activity (+7) bound exactly to 35 pts.</p>
                  </div>
                  <div className="space-y-3 p-5 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors">
                     <strong className="block text-amber-500 text-base">LeetCode (30%)</strong>
                     <p className="leading-relaxed">Hard (x5) + Medium (x2.5) + Easy (x1) mapped against dynamic global competition benchmarks, scaled up mathematically: Math.min(Score/100 × 30).</p>
                  </div>
                  <div className="space-y-3 p-5 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors">
                     <strong className="block text-violet-500 text-base">Web3 (15%)</strong>
                     <p className="leading-relaxed">Standard wallet instantiation (+5), accompanied strictly by heavy on-chain transaction scaling (+5) and protocol-level ENS resolution validations (+5).</p>
                  </div>
                  <div className="space-y-3 p-5 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors">
                     <strong className="block text-cyan-500 text-base">LinkedIn (10%)</strong>
                     <p className="leading-relaxed">OAuth boolean handshake mapping against valid corporate career networks (+7), supplemented structurally via Email KYC validation (+3).</p>
                  </div>
                  <div className="space-y-3 p-5 rounded-3xl bg-neutral-900/50 border border-white/5 hover:border-white/10 transition-colors">
                     <strong className="block text-emerald-500 text-base">Domain (10%)</strong>
                     <p className="leading-relaxed">Enterprise/institutional email ownership proofs statically asserted across registered, non-public global TLDs (+10 max scaling).</p>
                  </div>
               </div>
               
               <div className="mt-8 pt-8 border-t border-white/10 text-xs md:text-sm text-neutral-500 font-mono flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <span className="bg-secondary px-4 py-2 rounded-lg border border-border">Core Logic: min(∑ Weighted Integrations, 100)</span>
                  <span className="uppercase tracking-[0.2em] font-black text-[10px]">v2.1.0 Algorithm Protocol</span>
               </div>
            </div>
         </div>
      </section>

      {/* Trust Logos */}
      <section className="text-center py-20 border-y border-border/50 space-y-12">
        <h2 className="text-muted-foreground font-semibold uppercase tracking-[0.2em] text-sm">Integrates with your fundamental platforms</h2>
        <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-3 cursor-pointer"><SiEthereum className="w-8 h-8"/> <span className="text-2xl font-bold">Ethereum</span></div>
           <button onClick={loginWithGithub} className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer outline-none">
              <SiGithub className="w-8 h-8"/> 
              <span className="text-2xl font-bold">GitHub</span>
           </button>
           <div className="flex items-center gap-3"><FaLinkedin className="w-8 h-8"/> <span className="text-2xl font-bold">LinkedIn</span></div>
           <div className="flex items-center gap-3"><SiLeetcode className="w-8 h-8"/> <span className="text-2xl font-bold">LeetCode</span></div>
           <div className="flex items-center gap-3"><Globe className="w-8 h-8"/> <span className="text-2xl font-bold">Domains</span></div>
        </div>
      </section>

    </div>
  );
}
