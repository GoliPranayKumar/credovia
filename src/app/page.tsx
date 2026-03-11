"use client";

import Link from "next/link";
import { ShieldCheck, Github, Linkedin, Globe, Search, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="space-y-32">
      {/* Hero Section */}
      <section className="relative pt-12 text-center space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-4"
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
          <span className="gradient-text">A Single Number.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Verify your professional standing with our <strong>Weighted Credibility Model</strong>. 
          Connect your Web3 wallet, GitHub, and Google identity to generate a transparent, 0–100 trust score.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-xl shadow-black/5 hover:shadow-black/10 transition-all hover:-translate-y-1 active:scale-95 text-lg border border-border"
          >
            Create Your Profile
          </Link>
          <Link 
            href="/search" 
            className="w-full sm:w-auto px-8 py-4 bg-secondary border border-border text-foreground font-bold rounded-2xl hover:bg-orange-50 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-lg shadow-sm"
          >
            <Search className="w-5 h-5 text-orange-600" />
            Find Users
          </Link>
        </motion.div>

        {/* Floating Icons background effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-full max-w-4xl opacity-10 blur-3xl pointer-events-none text-orange-300">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-200 rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-red-100 rounded-full" />
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "40% Crypto Analysis",
            desc: "On-chain verification of wallet age, transaction frequency, and token diversity via Alchemy.",
            icon: ShieldCheck,
            color: "text-orange-600"
          },
          {
            title: "25% GitHub Presence",
            desc: "Quantitative analysis of repositories, contributions, and account established history.",
            icon: Github,
            color: "text-orange-700"
          },
          {
            title: "Multi-Layer Identity",
            desc: "Weighted scoring including Google Verification (10%), ENS Ownership (10%), and Peer Endorsements.",
            icon: Trophy,
            color: "text-orange-600"
          }
        ].map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl glass hover:border-orange-200 transition-colors space-y-4 shadow-sm"
          >
            <div className={`w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center ${f.color} border border-orange-100 shadow-inner`}>
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </section>



      {/* Trust Logos */}
      <section className="text-center py-20 border-y border-border/50 space-y-12">
        <h2 className="text-muted-foreground font-semibold uppercase tracking-[0.2em] text-sm">Integrates with your favorite platforms</h2>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-3"><Github className="w-8 h-8"/> <span className="text-2xl font-bold">GitHub</span></div>
           <div className="flex items-center gap-3"><Linkedin className="w-8 h-8"/> <span className="text-2xl font-bold">LinkedIn</span></div>
           <div className="flex items-center gap-3"><Globe className="w-8 h-8"/> <span className="text-2xl font-bold">Websites</span></div>
        </div>
      </section>

    </div>
  );
}
