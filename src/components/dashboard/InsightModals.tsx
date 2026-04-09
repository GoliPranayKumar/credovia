"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Loader2, Award, Zap, Activity, Layers, ShieldCheck, 
  Fingerprint, Rocket, Users2, FileText, Calendar, ExternalLink, 
  Globe, Code2, Lightbulb, Linkedin, CheckCircle2, RefreshCw, Link as LinkIcon
} from "lucide-react";
import { calculateCredibilityScore } from "@/lib/score";
import { getLeetCodeRank } from "@/lib/leetcode";

interface InsightModalsProps {
  profile: any;
  // GitHub
  showGithubInsights: boolean;
  setShowGithubInsights: (show: boolean) => void;
  githubStats: any[];
  // Alchemy
  showAlchemyInsights: boolean;
  setShowAlchemyInsights: (show: boolean) => void;
  loadingAlchemy: boolean;
  alchemyData: any;
  // Domain
  showDomainInsights: boolean;
  setShowDomainInsights: (show: boolean) => void;
  loadingDomain: boolean;
  domainData: any;
  // LeetCode
  showLeetcodeInsights: boolean;
  setShowLeetcodeInsights: (show: boolean) => void;
  loadingLeetcode: boolean;
  leetcodeData: any;
  leetcodeError: string | null;
  // LinkedIn
  showLinkedinInsights: boolean;
  setShowLinkedinInsights: (show: boolean) => void;
  loadingLinkedin: boolean;
  linkedinData: any;
}

export function InsightModals({
  profile,
  showGithubInsights, setShowGithubInsights, githubStats,
  showAlchemyInsights, setShowAlchemyInsights, loadingAlchemy, alchemyData,
  showDomainInsights, setShowDomainInsights, loadingDomain, domainData,
  showLeetcodeInsights, setShowLeetcodeInsights, loadingLeetcode, leetcodeData, leetcodeError,
  showLinkedinInsights, setShowLinkedinInsights, loadingLinkedin, linkedinData
}: InsightModalsProps) {
  
  return (
    <>
      {/* GitHub Detailed Insights Modal */}
      <AnimatePresence>
        {showGithubInsights && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGithubInsights(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  {/* ... same as before, extracted ... */}
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-800 border border-blue-100">
                      <Rocket className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground leading-tight">Platform Intelligence</h2>
                      <p className="text-sm text-muted-foreground font-medium italic">GitHub Verified Protocol</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowGithubInsights(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {githubStats.map((stat, i) => (
                    <div key={i} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:border-primary/30 transition-all group">
                      <div className="flex items-center justify-between">
                        <stat.icon className="w-5 h-5 text-blue-400 group-hover:text-primary transition-colors" />
                        {stat.pts > 0 && (
                           <span className="text-[8px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded-full">+{stat.pts} MAX</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-lg font-black text-foreground">{stat.value}</div>
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600/60 ml-1">Deep Intelligence Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { 
                        check: (profile.githubStarCount > 50), 
                        icon: Rocket, 
                        color: "text-emerald-600", 
                        bg: "bg-emerald-50",
                        border: "border-emerald-100",
                        title: "High Impact Creator", 
                        desc: "Your code repository stars indicate significant community trust and architectural stability." 
                      },
                      { 
                        check: (profile.githubFollowerCount > 100), 
                        icon: Users2, 
                        color: "text-blue-600", 
                        bg: "bg-blue-50",
                        border: "border-blue-100",
                        title: "Ecosystem Influencer", 
                        desc: "Your follower count puts you in the top tier of social credibility within the developer network." 
                      },
                      { 
                        check: (profile.githubContributionCount > 500), 
                        icon: Activity, 
                        color: "text-indigo-600", 
                        bg: "bg-indigo-50",
                        border: "border-indigo-100",
                        title: "Consistency Vector: High", 
                        desc: "Exceptional code velocity over time. This metric significantly stabilizes your credibility score." 
                      },
                      { 
                        check: (profile.githubGistCount > 5), 
                        icon: FileText, 
                        color: "text-amber-600", 
                        bg: "bg-amber-50",
                        border: "border-amber-100",
                        title: "Knowledge Sharer", 
                        desc: "Frequent Gist activity suggests a high degree of transparency and technical documentation focus." 
                      }
                    ].filter(insight => insight.check).map((insight, i) => (
                      <div key={i} className={`p-4 rounded-[2rem] ${insight.bg} ${insight.border} border space-y-2`}>
                        <div className="flex items-center gap-2">
                          <insight.icon className={`w-4 h-4 ${insight.color}`} />
                          <h4 className={`text-xs font-black ${insight.color} uppercase tracking-tight`}>{insight.title}</h4>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">{insight.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total GitHub Weighted Vector</div>
                    <div className="text-3xl font-black text-foreground">
                      {calculateCredibilityScore(profile).breakdown.github} <span className="text-sm text-muted-foreground">/ 35 Pts</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowGithubInsights(false)}
                    className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-black rounded-2xl hover:bg-blue-600 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alchemy Detailed Insights Modal */}
      <AnimatePresence>
        {showAlchemyInsights && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAlchemyInsights(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-800 border border-indigo-100">
                      <LinkIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground leading-tight">Web3 Evaluation</h2>
                      <p className="text-sm text-muted-foreground font-medium italic">On-Chain Asset Analysis</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAlchemyInsights(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>

                {loadingAlchemy ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Querying Blockchain...</p>
                  </div>
                ) : alchemyData ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:border-indigo-400/30 transition-all group">
                        <div className="flex items-center justify-between">
                          <Award className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-[8px] font-black text-indigo-600 px-1.5 py-0.5 bg-indigo-600/10 rounded-full">NFTS</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-lg font-black text-foreground">{alchemyData.nfts}</div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Total Assets</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:border-amber-400/30 transition-all group">
                        <div className="flex items-center justify-between">
                          <Zap className="w-5 h-5 text-amber-400 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[8px] font-black text-amber-600 px-1.5 py-0.5 bg-amber-600/10 rounded-full">ETH</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-lg font-black text-foreground">{alchemyData.balance?.substring(0, 6) || "0.00"}</div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Balance</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:border-blue-400/30 transition-all group">
                        <div className="flex items-center justify-between">
                          <Activity className="w-5 h-5 text-blue-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-lg font-black text-foreground">{alchemyData.transactionCount || 0}</div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Recent Txns</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:border-pink-400/30 transition-all group">
                        <div className="flex items-center justify-between">
                          <Layers className="w-5 h-5 text-pink-400 group-hover:text-pink-500 transition-colors" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-lg font-black text-foreground">{alchemyData.tokenDiversity || 0}</div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Token Types</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2 hover:border-emerald-400/30 transition-all group">
                        <div className="flex items-center justify-between">
                          <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-[8px] font-black text-emerald-600 px-1.5 py-0.5 bg-emerald-600/10 rounded-full">STATUS</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-md mt-1 font-black text-foreground">{alchemyData.isVerified ? 'VERIFIED' : 'PENDING'}</div>
                          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">On-Chain</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600/60 ml-1">Protocol Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {alchemyData.nfts > 0 && (
                           <div className="p-4 rounded-[2rem] bg-indigo-50 border border-indigo-100 space-y-2">
                             <div className="flex items-center gap-2">
                               <Fingerprint className="w-4 h-4 text-indigo-600" />
                               <h4 className="text-xs font-black text-indigo-600 uppercase tracking-tight">Active Collector</h4>
                             </div>
                             <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">Wallet holder has multiple digital assets indicating robust on-chain engagement.</p>
                           </div>
                        )}
                        {parseFloat(alchemyData.balance || "0") > 0.1 && (
                           <div className="p-4 rounded-[2rem] bg-amber-50 border border-amber-100 space-y-2">
                             <div className="flex items-center gap-2">
                               <Zap className="w-4 h-4 text-amber-600" />
                               <h4 className="text-xs font-black text-amber-600 uppercase tracking-tight">High Liquidity</h4>
                             </div>
                             <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">Wallet maintains healthy token balances for transaction gas and DeFi activities.</p>
                           </div>
                        )}
                        {alchemyData.transactionCount > 10 && (
                           <div className="p-4 rounded-[2rem] bg-blue-50 border border-blue-100 space-y-2">
                             <div className="flex items-center gap-2">
                               <Activity className="w-4 h-4 text-blue-600" />
                               <h4 className="text-xs font-black text-blue-600 uppercase tracking-tight">Ecosystem Participant</h4>
                             </div>
                             <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">Heavy transaction history shows active usage of Web3 infrastructure rather than just holding.</p>
                           </div>
                        )}
                        {alchemyData.tokenDiversity > 3 && (
                           <div className="p-4 rounded-[2rem] bg-pink-50 border border-pink-100 space-y-2">
                             <div className="flex items-center gap-2">
                               <Layers className="w-4 h-4 text-pink-600" />
                               <h4 className="text-xs font-black text-pink-600 uppercase tracking-tight">Diversified Portfolio</h4>
                             </div>
                             <p className="text-[10px] text-slate-600 leading-relaxed font-medium italic">Holds multiple types of ERC-20 tokens showing advanced navigation of decentralized finance.</p>
                           </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-red-500 font-bold">No Web3 Data Found.</p>
                  </div>
                )}

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Web3 Weighted Vector</div>
                    <div className="text-3xl font-black text-foreground">
                      {calculateCredibilityScore(profile).breakdown.crypto} <span className="text-sm text-muted-foreground">/ 15 Pts</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAlchemyInsights(false)}
                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LinkedIn Insights Modal */}
      <AnimatePresence>
        {showLinkedinInsights && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLinkedinInsights(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-sky-50 rounded-2xl text-sky-700 border border-sky-100">
                      <Linkedin className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground leading-tight">Career Intelligence</h2>
                      <p className="text-sm text-muted-foreground font-medium italic">RapidAPI Intelligence</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLinkedinInsights(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>

                {loadingLinkedin ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                    <p className="text-sm font-bold text-muted-foreground tracking-widest uppercase">Scraping Professional Vector...</p>
                  </div>
                ) : linkedinData ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-6 items-center md:items-start p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      {linkedinData.photo ? (
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0">
                          <img src={linkedinData.photo} alt={linkedinData.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-100 border-4 border-white shadow-lg shrink-0 flex items-center justify-center text-3xl font-black text-blue-600">
                          {profile.name[0]}
                        </div>
                      )}
                      
                      <div className="space-y-2 text-center md:text-left flex-1">
                        <div className="flex items-center gap-3">
                           <h3 className="text-2xl font-black text-foreground">{linkedinData.name || profile.name}</h3>
                           {(linkedinData.isVerified || profile.linkedin?.includes('verified')) && (
                             <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
                               <ShieldCheck className="w-2.5 h-2.5" />
                               Verified Identity
                             </div>
                           )}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100/50 text-sky-800 rounded-full text-xs font-black uppercase tracking-widest border border-sky-200">
                           <Award className="w-3.5 h-3.5" />
                           {linkedinData.title || "Professional"}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-red-500 font-bold">Failed to load Professional Insights.</p>
                  </div>
                )}

                <div className="pt-6 border-t border-border flex justify-center sm:justify-end">
                  <button 
                    onClick={() => setShowLinkedinInsights(false)}
                    className="w-full sm:w-auto px-8 py-3 bg-sky-600 text-white font-black rounded-2xl hover:bg-sky-700 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-sky-600/20"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Official Domain Insights Modal */}
      <AnimatePresence>
        {showDomainInsights && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDomainInsights(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                {/* ... Domain content ... */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-3xl text-blue-600 shadow-inner">
                      <Globe className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight">Domain Intelligence</h2>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Protocol</span>
                      </div>
                    </div>
                  </div>
                   <button onClick={() => setShowDomainInsights(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {loadingDomain ? (
                   <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-black text-slate-500">Scanning Infrastructure...</p>
                  </div>
                ) : domainData ? (
                  <div className="space-y-6 text-sm">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <h4 className="font-black text-foreground mb-2">Verified Host: {domainData.domain}</h4>
                       <p className="text-slate-600 font-medium italic">Organization: {domainData.organization}</p>
                       <p className="text-slate-600 font-medium italic">Security: {domainData.security}</p>
                    </div>
                  </div>
                ) : null}

                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-4">
                  <button 
                    onClick={() => setShowDomainInsights(false)}
                    className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LeetCode Insights Modal */}
      <AnimatePresence>
        {showLeetcodeInsights && leetcodeData && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeetcodeInsights(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-50 rounded-3xl text-orange-600 shadow-inner border border-orange-100">
                      <Code2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight">LeetCode Intelligence</h2>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{getLeetCodeRank(leetcodeData.finalScore)}</span>
                    </div>
                  </div>
                   <button onClick={() => setShowLeetcodeInsights(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100">
                       <div className="text-[10px] font-black uppercase text-emerald-600 mb-1">Easy</div>
                       <div className="text-2xl font-black text-foreground">{leetcodeData.easy}</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100">
                       <div className="text-[10px] font-black uppercase text-amber-600 mb-1">Medium</div>
                       <div className="text-2xl font-black text-foreground">{leetcodeData.medium}</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100">
                       <div className="text-[10px] font-black uppercase text-rose-600 mb-1">Hard</div>
                       <div className="text-2xl font-black text-foreground">{leetcodeData.hard}</div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-2xl font-black text-foreground">
                      Score: {leetcodeData.finalScore} / 100
                    </div>
                  <button 
                    onClick={() => setShowLeetcodeInsights(false)}
                    className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
