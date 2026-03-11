"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreProgress, ScoreBreakdownView, ScoreGauge } from "@/components/ScoreVisuals";
import { 
  Github, 
  Linkedin, 
  Globe, 
  ExternalLink, 
  Edit3, 
  Save, 
  Loader2,
  LogOut,
  ShieldCheck,
  Download,
  Award,
  RefreshCw,
  Link as LinkIcon,
  LayoutDashboard,
  Fingerprint,
  TrendingUp,
  Users
} from "lucide-react";
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from "@/lib/appwrite";
import { calculateCredibilityScore, getScoreDescription } from "@/lib/score";
import { motion, AnimatePresence } from "framer-motion";
import { CertificateTemplate } from "@/components/CertificateTemplate";
import html2canvas from "html2canvas";
import jsPDF from "jsPDF";

export default function DashboardPage() {
  const { user, profile, loading, logout, refresh } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        bio: profile.bio,
        github: profile.github,
        linkedin: profile.linkedin,
        portfolio: profile.portfolio,
        walletAddress: profile.walletAddress,
      });
    }
  }, [profile]);

  if (loading || !user || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { total: newScore } = calculateCredibilityScore(formData);
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        profile.$id,
        { ...formData, score: newScore }
      );
      await refresh();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async (platform: string) => {
    setSyncing(platform);
    await new Promise(r => setTimeout(r, 1500));
    setSyncing(null);
    await refresh();
  };

  const downloadCertificate = async () => {
    const element = document.getElementById("credovia-certificate");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#faf8ff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "px", [800, 600]);
      pdf.addImage(imgData, "PNG", 0, 0, 800, 600);
      pdf.save(`Credovia_Certificate_${profile.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Certificate Generation Error:", err);
      alert("Failed to generate certificate.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-foreground">
      {/* Hidden Certificate */}
      <div className="fixed overflow-hidden h-0 w-0 pointer-events-none opacity-0">
        <CertificateTemplate 
          name={profile.name} 
          score={profile.score} 
          date={new Date().toLocaleDateString()} 
          certificateId={`CR-${profile.$id.slice(0, 8).toUpperCase()}`}
        />
      </div>

      {/* Top Section: Verification Hub (Full Width) */}
      <section className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] glass border-border/50 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-50/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
           <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-[10px] font-black uppercase tracking-widest">
                 <ShieldCheck className="w-3 h-3" />
                 Protocol Sync Active
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                  Verification <span className="text-primary italic">Hub</span>
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                 Manage your digital reputation by authorizing multi-source data extraction. 
                 Sync your on-chain assets, development activity, and social presence.
              </p>
           </div>
           
           <div className="flex flex-wrap gap-3">
               <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-sm border border-primary/20"
               >
                  {isEditing ? <><Save className="w-5 h-5" /> Save Changes</> : <><Edit3 className="w-5 h-5" /> Edit Profile</>}
               </button>
               <button 
                  onClick={logout}
                  className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500/20 transition-all group"
               >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
               </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
           {[
             { name: "Alchemy / Web3", desc: "Digital Assets", icon: LinkIcon, color: "text-blue-700", val: profile.walletAddress },
             { name: "GitHub SSO", desc: "Dev Activity", icon: Github, color: "text-blue-800", val: profile.github },
             { name: "Official Domain", desc: "DNS & Web", icon: Globe, color: "text-blue-700", val: profile.portfolio }
           ].map((platform, i) => (
              <div key={i} className="p-5 rounded-[2rem] bg-white border border-border space-y-4 hover:bg-blue-50 transition-all group shadow-sm">
                 <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl bg-blue-50 ${platform.color} border border-blue-100 shadow-inner`}>
                       <platform.icon className="w-5 h-5" />
                    </div>
                    <div className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${platform.val ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : "bg-blue-100 border-blue-200 text-blue-700"} uppercase`}>
                       {platform.val ? "Verified" : "Pending"}
                    </div>
                 </div>
                 <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-foreground">{platform.name}</h3>
                    <p className="text-[10px] text-muted-foreground opacity-70 italic">{platform.desc}</p>
                 </div>
                 <button 
                  onClick={() => handleSync(platform.name)}
                  disabled={syncing === platform.name}
                  className="w-full py-2.5 bg-blue-50/50 hover:bg-blue-100 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-blue-800"
                 >
                    {syncing === platform.name ? <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> : <RefreshCw className="w-3 h-3" />}
                    Authorize & Sync
                 </button>
              </div>
           ))}
        </div>
      </section>

      {/* Grid Layout: Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Identity & Reputation Card (Left / 4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="p-6 md:p-8 rounded-[2.5rem] glass border-border bg-white space-y-6 flex flex-col items-center text-center shadow-sm">
            <div className="space-y-1">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/60">Live Reputation</h3>
              <h2 className="text-xl font-black text-foreground">Score Matrix</h2>
            </div>
            
            <div className="relative">
              <ScoreGauge score={profile.score} />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-border px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                 <Fingerprint className="w-2.5 h-2.5 text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Identity PK</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <ScoreProgress score={profile.score} />
              <div className="p-3 rounded-xl bg-blue-50/30 border border-blue-100 italic text-[10px] text-muted-foreground leading-relaxed">
                 "{getScoreDescription(profile.score)}"
              </div>
            </div>

            <div className="w-full pt-4 border-t border-border space-y-3 text-left">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-blue-600/40 px-2">Verified Connections</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "GitHub", val: profile.github, icon: Github, color: "text-blue-800" },
                  { label: "LinkedIn", val: profile.linkedin, icon: Linkedin, color: "text-blue-700" },
                  { label: "Web3", val: profile.walletAddress, icon: ShieldCheck, color: "text-blue-800" },
                ].map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/20 border border-border group hover:bg-blue-50 transition-all">
                    <div className="flex items-center gap-3">
                      <link.icon className={`w-3.5 h-3.5 ${link.color}`} />
                      <span className="text-[11px] font-bold text-foreground">{link.label}</span>
                    </div>
                    {link.val ? (
                      <a href={link.val} target="_blank" rel="noreferrer" className="p-1 px-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[9px] text-blue-200 font-bold uppercase">Null</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full pt-4 mt-2">
              <button 
                onClick={downloadCertificate}
                className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white font-black rounded-2xl shadow-sm hover:translate-y-1 active:scale-95 transition-all group relative overflow-hidden border border-primary/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Award className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                <span className="text-xs uppercase tracking-widest">Download Certificate</span>
                <Download className="w-4 h-4" />
              </button>
              <p className="text-[8px] text-muted-foreground mt-3 font-bold uppercase tracking-widest opacity-40">
                Verifiable Protocol Artifact
              </p>
            </div>

            {/* Space Filler: Protocol Rank & Health */}
            <div className="w-full mt-4 p-6 rounded-[2rem] bg-gradient-to-br from-blue-50 to-transparent border border-blue-100 space-y-5">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Trust Health</h4>
                     <p className="text-[8px] text-emerald-600 font-black uppercase">Optimized & Secure</p>
                  </div>
               </div>

               <div className="space-y-3">
                  {[
                    { label: "Global Percentile", val: "Top 8.2%", icon: Users },
                    { label: "Protocol Rank", val: "Alpha Elite", icon: Award },
                    { label: "Growth Vector", val: "+14.2%", icon: TrendingUp },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between group">
                       <div className="flex items-center gap-2">
                          <stat.icon className="w-3 h-3 text-blue-400 group-hover:text-blue-700 transition-colors" />
                          <span className="text-[9px] font-bold text-blue-800/60 uppercase tracking-tighter">{stat.label}</span>
                       </div>
                       <span className="text-[10px] font-black text-foreground">{stat.val}</span>
                    </div>
                  ))}
               </div>

               <div className="pt-4 border-t border-blue-100">
                  <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden border border-blue-200">
                     <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-blue-500" />
                  </div>
                  <p className="text-[7px] text-center mt-2 text-muted-foreground uppercase font-black tracking-[0.3em]">Institutional Verification Ready</p>
               </div>
            </div>
          </section>
        </aside>

        {/* Pictorial Analysis (Right / 8 cols) */}
        <main className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.form 
                key="edit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onSubmit={handleSave} 
                className="p-8 rounded-[2.5rem] glass border-border bg-white space-y-6 shadow-sm"
              >
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-foreground">Meta Update</h3>
                  <p className="text-xs text-muted-foreground">Modify protocol parameters.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-700 ml-1">Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-blue-50/30 border border-border rounded-xl py-3 px-5 focus:ring-1 focus:ring-blue-400 outline-none transition-all text-foreground font-bold text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-700 ml-1">LinkedIn</label>
                    <input 
                      type="text" 
                      className="w-full bg-blue-50/30 border border-border rounded-xl py-3 px-5 focus:ring-1 focus:ring-blue-400 outline-none transition-all text-foreground font-bold text-sm"
                      value={formData.linkedin}
                      placeholder="https://..."
                      onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-blue-700 ml-1">Biometric Brief</label>
                  <textarea 
                    className="w-full bg-blue-50/30 border border-border rounded-xl py-3 px-5 focus:ring-1 focus:ring-blue-400 outline-none transition-all min-h-[100px] text-foreground font-medium text-sm italic"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-700 ml-1">GitHub Endpoint</label>
                    <input 
                      type="text" 
                      className="w-full bg-blue-50/30 border border-border rounded-xl py-3 px-5 focus:ring-1 focus:ring-blue-400 outline-none transition-all text-foreground font-bold text-sm"
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-700 ml-1">Web Address</label>
                    <input 
                      type="text" 
                      className="w-full bg-blue-50/30 border border-border rounded-xl py-3 px-5 focus:ring-1 focus:ring-blue-400 outline-none transition-all text-foreground font-bold text-sm"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all text-xs border border-primary/20"
                    >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
                    Confirm Sync
                    </button>
                    <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-8 bg-blue-50 text-blue-900 font-black uppercase tracking-[0.2em] py-4 rounded-2xl active:scale-95 transition-all text-xs border border-blue-200"
                    >
                    Cancel
                    </button>
                </div>
              </motion.form>
            ) : (
              <motion.section 
                key="view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="p-8 rounded-[2.5rem] glass border-border bg-white space-y-8 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-30">
                   <div className="flex gap-1.5">
                      {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-200" />)}
                   </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <LayoutDashboard className="w-5 h-5 text-blue-600" />
                     <h3 className="text-2xl font-black tracking-tight text-foreground">Spatial Intelligence</h3>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                    Weighted visualization of your credibility vector.
                  </p>
                </div>

                {profile && (
                  <ScoreBreakdownView 
                    breakdown={calculateCredibilityScore(profile).breakdown} 
                  />
                )}
                
                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-600/60 font-bold text-[9px] uppercase tracking-[0.2em]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Telemetry Verified</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono">
                    SYNC: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>


      {/* Footer Meta */}
      <footer className="pt-8 text-center pb-12 border-t border-border mx-10">
        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.5em]">
          Credovia Protocol • v1.0.4-Stable
        </p>
      </footer>
    </div>
  );
}
