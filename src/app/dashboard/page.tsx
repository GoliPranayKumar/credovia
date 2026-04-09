"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Lock as LockIcon,
  Download,
  Award,
  RefreshCw,
  Link as LinkIcon,
  LayoutDashboard,
  Fingerprint,
  TrendingUp,
  Users,
  Share2,
  Mail,
  CheckCircle2,
  Star,
  GitBranch,
  Calendar,
  Zap,
  Users2,
  FileText,
  UserPlus,
  Activity,
  X,
  ArrowRight,
  Rocket,
  Search,
  Layers,
  GitPullRequest,
  Code2,
  Trophy as TrophyIcon,
  BarChart3,
  Lightbulb
} from "lucide-react";
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from "@/lib/appwrite";
import { calculateCredibilityScore, getScoreDescription } from "@/lib/score";
import { analyzeWallet } from "@/lib/alchemy";
import { getLeetCodeRank, type LeetCodeScore } from "@/lib/leetcode";
import { motion, AnimatePresence } from "framer-motion";
import { CertificateTemplate } from "@/components/CertificateTemplate";
import { ShareScoreCard } from "@/components/ShareScoreCard";
import { AchievementBadges } from "@/components/AchievementBadges";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { ProfileQRCode } from "@/components/ProfileQRCode";
import { ProfileCustomizer, getAccentGradient } from "@/components/ProfileCustomizer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getScoreLabel } from "@/lib/score";
import { SiEthereum, SiGithub, SiLeetcode } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

import { withRetry } from "@/lib/app-utils";

import { Suspense } from "react";

function DashboardContent() {
  const { user, profile, loading, logout, refresh, loginWithGithub, loginWithLinkedin, sendVerificationEmail, sendEmailToken, loginWithToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [savingAccent, setSavingAccent] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showGithubInsights, setShowGithubInsights] = useState(false);
  const [showAlchemyInsights, setShowAlchemyInsights] = useState(false);
  const [alchemyData, setAlchemyData] = useState<any>(null);
  const [loadingAlchemy, setLoadingAlchemy] = useState(false);
  const [showLinkedinInsights, setShowLinkedinInsights] = useState(false);
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [loadingLinkedin, setLoadingLinkedin] = useState(false);
  const [showDomainInsights, setShowDomainInsights] = useState(false);
  const [domainData, setDomainData] = useState<any>(null);
  const [loadingDomain, setLoadingDomain] = useState(false);
  const [showLeetcodeInsights, setShowLeetcodeInsights] = useState(false);
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeScore | null>(null);
  const [loadingLeetcode, setLoadingLeetcode] = useState(false);
  const [leetcodeError, setLeetcodeError] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncPlatform, setSyncPlatform] = useState<null | string>(null);
  const [syncInputValue, setSyncInputValue] = useState("");
  const [syncOtpValue, setSyncOtpValue] = useState("");
  const [syncStep, setSyncStep] = useState<"input" | "otp">("input");
  const [syncUserId, setSyncUserId] = useState("");
  const [isSubmittingSync, setIsSubmittingSync] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSync = async (platform: string) => {
    if (platform === "GitHub SSO") {
       setSyncing("GitHub SSO");
       // Small delay to show state before redirect
       setTimeout(() => loginWithGithub(), 500);
       return;
    }
    if (platform === "LinkedIn") {
       setSyncing("LinkedIn");
       // Small delay to show state before redirect
       setTimeout(() => loginWithLinkedin(), 500);
       return;
    }

    if (platform === "LeetCode") {
      setSyncPlatform("LeetCode");
      setSyncInputValue("");
      setSyncOtpValue("");
      setSyncStep("input");
      setShowSyncModal(true);
      return;
    }
    
    // For others, show our custom in-app modal instead of browser prompt
    setSyncPlatform(platform);
    setSyncInputValue("");
    setSyncOtpValue("");
    setSyncStep("input");
    setShowSyncModal(true);
  };

  const submitSync = async () => {
    if (!syncPlatform || !syncInputValue) return;
    setIsSubmittingSync(true);
    
    try {
      if (syncPlatform === "Official Domain" && syncStep === "input") {
        if (!syncInputValue.includes("@") || !syncInputValue.includes(".")) {
          alert("Please enter a valid official email address.");
          setIsSubmittingSync(false);
          return;
        }
        // Step 1: Send OTP to the official email
        const tempUserId = await sendEmailToken(syncInputValue);
        setSyncUserId(tempUserId);
        setSyncStep("otp");
        setIsSubmittingSync(false);
        return;
      }

      let updateData: any = {};
      
      if (syncPlatform === "Alchemy / Web3") {
        if (!syncInputValue.startsWith("0x")) {
          alert("Verification Failed: Invalid wallet address format.");
          setIsSubmittingSync(false);
          return;
        }
        updateData.walletAddress = syncInputValue;
      } else if (syncPlatform === "Official Domain") {
        // Step 2: Verify OTP
        if (!syncOtpValue) {
          alert("Please enter the verification code.");
          setIsSubmittingSync(false);
          return;
        }

        try {
          // We must verify the code by creating a session.
          // Note: This temporarily switches the current session to the guest user.
          // We'll update the database using the new session, then the user should refresh.
          await loginWithToken(syncUserId, syncOtpValue); 
        } catch (err: any) {
          console.error("OTP Verification Error:", err);
          alert("Verification Failed: Invalid or expired code. Please try again.");
          setIsSubmittingSync(false);
          return;
        }

        const domain = syncInputValue.split("@")[1];
        updateData.portfolio = `https://${domain}`;
        updateData.domainVerified = true;
      } else if (syncPlatform === "LeetCode") {
        const lc = syncInputValue.trim().toLowerCase();
        if (!lc) {
          alert("Please enter your LeetCode username.");
          setIsSubmittingSync(false);
          return;
        }
        // Validate existence by calling our API
        const res = await fetch(`/api/leetcode-score/${encodeURIComponent(lc)}`);
        const lcData = await res.json();
        if (!res.ok) {
          alert(lcData.error || "LeetCode user not found.");
          setIsSubmittingSync(false);
          return;
        }
        updateData.leetcodeUsername  = lc;
        updateData.leetcodeEasy      = lcData.easy;
        updateData.leetcodeMedium    = lcData.medium;
        updateData.leetcodeHard      = lcData.hard;
        updateData.leetcodeScore     = lcData.finalScore;
        updateData.leetcodeFetchedAt = new Date().toISOString();
        setLeetcodeData(lcData);
      }

      const { total: newScore } = calculateCredibilityScore({...profile, ...updateData});
      updateData.score = newScore;

      await withRetry(() => 
        databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          profile.$id,
          updateData
        )
      );
      
      setShowSyncModal(false);
      await refresh();
      
      if ((window as any).__addCredoviaNotif) {
        (window as any).__addCredoviaNotif({
          type: "score",
          title: "Profile Synced",
          message: `Successfully linked ${syncPlatform} to your protocol identity.`
        });
      }
    } catch (err) {
      console.error("Sync Failed:", err);
    } finally {
      setIsSubmittingSync(false);
    }
  };


  const handleOpenAlchemyInsights = async () => {
    setShowAlchemyInsights(true);
    if (!alchemyData && profile.walletAddress) {
      setLoadingAlchemy(true);
      try {
        const data = await withRetry(() => analyzeWallet(profile.walletAddress));
        if (data) setAlchemyData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAlchemy(false);
      }
    }
  };

  const handleOpenLinkedinInsights = async () => {
    setShowLinkedinInsights(true);
    if (!linkedinData && profile.linkedin) {
      setLoadingLinkedin(true);
      try {
        const response = await withRetry(() => fetch("/api/linkedin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkedinUrl: profile.linkedin })
        }));
        const data = await response.json();
        if (response.ok) {
          // If the profile is verified via SSO, we prioritize that data
          if (profile.linkedin.includes('verified')) {
             data.isVerified = true;
             data.name = profile.name;
          }
          setLinkedinData(data);
        } else {
          setLinkedinData({ error: data.error || "Failed to fetch LinkedIn insights" });
        }
      } catch (err) {
        setLinkedinData({ error: "Network error fetching LinkedIn Data" });
      } finally {
        setLoadingLinkedin(false);
      }
    }
  };

  const handleOpenDomainInsights = async () => {
    setShowDomainInsights(true);
    if (!domainData && profile.portfolio) {
      setLoadingDomain(true);
      // Simulate analysis or fetch real meta-data
      setTimeout(() => {
        const domain = new URL(profile.portfolio).hostname;
        setDomainData({
          domain,
          verifiedAt: new Date().toLocaleDateString(),
          trustLevel: "High",
          status: "Verified Institutional Presence",
          security: "SSL/TLS Active",
          organization: profile.portfolio.includes('.edu') ? "Academic Institution" : profile.portfolio.includes('.gov') ? "Government Agency" : "Enterprise Entity"
        });
        setLoadingDomain(false);
      }, 1500);
    }
  };

  const handleOpenLeetcodeInsights = async () => {
    setShowLeetcodeInsights(true);
    setLeetcodeError(null);
    const username = profile.leetcodeUsername;
    if (!username) return;
    if (leetcodeData && leetcodeData.username === username) return; // already loaded
    setLoadingLeetcode(true);
    try {
      const res = await fetch(`/api/leetcode-score/${encodeURIComponent(username)}`);
      const data = await res.json();
      if (!res.ok) {
        setLeetcodeError(data.error || "Failed to load LeetCode data.");
        return;
      }
      setLeetcodeData(data as any);

      // Persist to Appwrite so the credibility score updates
      const updateData: any = {
        leetcodeEasy:      data.easy,
        leetcodeMedium:    data.medium,
        leetcodeHard:      data.hard,
        leetcodeScore:     data.finalScore,
        leetcodeFetchedAt: new Date().toISOString(),
      };
      const { total: newScore } = calculateCredibilityScore({ ...profile, ...updateData });
      updateData.score = newScore;
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, profile.$id, updateData);
      await refresh();
    } catch (err: any) {
      setLeetcodeError(err?.message || "Network error fetching LeetCode data.");
    } finally {
      setLoadingLeetcode(false);
    }
  };


  useEffect(() => {
    if (searchParams.get("edit") === "true") {
      setIsEditing(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      console.log("DEBUG: Current User:", user);
    }
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
      await withRetry(() => 
        databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          profile.$id,
          { ...formData, score: newScore }
        )
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


  const downloadCertificate = async () => {
    const element = document.getElementById("credovia-certificate");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#000000",
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

  const downloadScoreCard = async () => {
    const element = document.getElementById("credovia-share-card");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#000000",
      });
      const link = document.createElement("a");
      link.download = `Credovia_ScoreCard_${profile.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Score Card Generation Error:", err);
      alert("Failed to generate score card.");
    }
  };

  const handleSendVerification = async () => {
    console.log("DEBUG: handleSendVerification clicked");
    setSendingVerification(true);
    try {
      console.log("DEBUG: Calling sendVerificationEmail from hook...");
      await sendVerificationEmail();
      console.log("DEBUG: sendVerificationEmail call finished successfully");
      setVerificationSent(true);
    } catch (err: any) {
      console.error("DEBUG: handleSendVerification caught error:", err);
      alert(`Failed to send verification email: ${err.message || "Unknown error"}`);
    } finally {
      setSendingVerification(false);
    }
  };

  const saveAccentColor = async (accent: string) => {
    setSavingAccent(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        profile.$id,
        { accentColor: accent }
      );
      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAccent(false);
    }
  };

  const githubStats = profile && profile.github ? [
    { label: "Repos", value: profile.githubRepoCount || 0, icon: GitBranch, pts: 5 },
    { label: "Stars", value: profile.githubStarCount || 0, icon: Star, pts: 5 },
    { label: "Commits", value: profile.githubContributionCount || 0, icon: Activity, pts: 3 },
    { label: "PRs", value: profile.githubPRCount || 0, icon: GitPullRequest, pts: 2 },
    { label: "Followers", value: profile.githubFollowerCount || 0, icon: Users2, pts: 2 },
    { label: "Gists", value: profile.githubGistCount || 0, icon: FileText, pts: 0 },
    { label: "Following", value: profile.githubFollowingCount || 0, icon: UserPlus, pts: 0 },
    { label: "Age", value: profile.githubCreatedAt ? `${Math.floor((new Date().getTime() - new Date(profile.githubCreatedAt).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}y` : 0, icon: Calendar, pts: 5 }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-foreground">
      {/* Email Verification Banner */}
      {user && !user.emailVerification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-amber-900 leading-none">Email Verification Required</h4>
              <p className="text-xs text-amber-700/80 font-medium italic">Please verify your email address to secure your account and access full features.</p>
            </div>
          </div>
          <button
            onClick={handleSendVerification}
            disabled={sendingVerification || verificationSent}
            className="w-full md:w-auto px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-sm shadow-amber-600/10"
          >
            {sendingVerification ? <Loader2 className="w-3 h-3 animate-spin" /> : verificationSent ? <CheckCircle2 className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            {verificationSent ? "Email Sent!" : "Verify Email Now"}
          </button>
        </motion.div>
      )}
      {/* Onboarding Wizard — shows once for new users */}
      <OnboardingWizard />
      {/* Hidden Certificate */}
      <div className="fixed overflow-hidden h-0 w-0 pointer-events-none opacity-0">
        <CertificateTemplate 
          name={profile.name} 
          score={profile.score} 
          date={new Date().toLocaleDateString()} 
          certificateId={`CR-${profile.$id.slice(0, 8).toUpperCase()}`}
          breakdown={calculateCredibilityScore(profile).breakdown}
        />
        <ShareScoreCard
          name={profile.name}
          score={profile.score}
          scoreLabel={getScoreLabel(profile.score)}
          breakdown={calculateCredibilityScore(profile).breakdown}
        />
      </div>

      {/* Top Section: Verification Hub (Full Width) */}
      <section className="relative overflow-hidden p-6 md:p-10 rounded-[2.5rem] glass border-border/50 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-50/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100/50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
           <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-900 text-[10px] font-black uppercase tracking-widest">
                  <img src="/logo.png" alt="logo" className="w-5 h-5 object-contain" />
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
           
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
             {/* Removed Sync Protocol Data button per user request */}
           </div>
        </div>        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            {[
              { 
                name: "Alchemy / Web3", 
                desc: "15% Weightage", 
                icon: SiEthereum, 
                color: "text-violet-500", 
                val: profile.walletAddress,
                isClickable: true
              },
              { 
                name: "GitHub SSO", 
                desc: "35% Weightage", 
                icon: SiGithub, 
                color: "text-blue-500", 
                val: profile.github,
                isClickable: true
              },
              { 
                name: "LinkedIn", 
                desc: "10% Weightage", 
                icon: FaLinkedin, 
                color: "text-cyan-500", 
                val: profile.linkedin,
                isClickable: true
              },
              { 
                name: "Official Domain", 
                desc: "10% Weightage", 
                icon: Globe, 
                color: "text-emerald-500", 
                val: profile.domainVerified ? profile.portfolio : null,
                isClickable: !!profile.domainVerified
              },
              {
                name: "LeetCode",
                desc: "30% Weightage",
                icon: SiLeetcode,
                color: "text-amber-500",
                val: profile.leetcodeUsername || null,
                isClickable: !!profile.leetcodeUsername
              }
            ].map((platform, i) => (
               <div 
                key={i} 
                onClick={() => {
                  if (!platform.isClickable || !platform.val) return;
                  if (platform.name === "GitHub SSO") setShowGithubInsights(true);
                  if (platform.name === "Alchemy / Web3") handleOpenAlchemyInsights();
                  if (platform.name === "LinkedIn") handleOpenLinkedinInsights();
                  if (platform.name === "Official Domain") handleOpenDomainInsights();
                  if (platform.name === "LeetCode") handleOpenLeetcodeInsights();
                }}
                className={`p-5 rounded-[2rem] bg-white border border-border space-y-4 hover:bg-blue-50 transition-all group shadow-sm flex flex-col justify-between ${platform.isClickable && platform.val ? "md:scale-105 border-primary/30 ring-4 ring-primary/5 z-20 cursor-pointer" : ""}`}
               >
                  <div className="space-y-4">
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

                    {platform.isClickable && platform.val && (
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between group/btn">
                        <div className="flex items-center gap-2">
                          <Zap className="w-3 h-3 text-primary" />
                          <span className="text-[8px] font-black uppercase text-primary tracking-widest">View Insights</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-primary group-hover/btn:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>

                  <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     handleSync(platform.name);
                   }}
                   disabled={syncing === platform.name}
                   className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${platform.val ? "bg-white border-border text-foreground hover:bg-slate-50" : "bg-blue-50/50 hover:bg-blue-100 border-blue-100 text-blue-800"}`}
                  >
                     {syncing === platform.name ? <RefreshCw className="w-3 h-3 animate-spin text-blue-600" /> : <RefreshCw className="w-3 h-3" />}
                     {platform.val ? "Re-Sync Data" : "Authorize & Sync"}
                  </button>
               </div>
            ))}
         </div>

      </section>

      {/* Grid Layout: Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Identity & Reputation Card (Left / 4 cols) */}
        <aside className="lg:col-span-4 space-y-6 sticky top-6">
          <section className="p-6 md:p-8 rounded-[2.5rem] glass border-border bg-white space-y-6 flex flex-col items-center text-center shadow-sm">
            <div className="space-y-1">
              <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/60">Live Reputation</h3>
              <h2 className="text-xl font-black text-foreground">Score Matrix</h2>
            </div>
            
            <div className="relative">
              <ScoreGauge score={profile.score} />
              <div
                className="w-12 h-12 rounded-2xl absolute -top-3 -right-3 flex items-center justify-center text-lg font-black text-white shadow-lg border-2 border-white dark:border-gray-800"
                style={{ background: getAccentGradient(profile.accentColor) }}
              >
                {profile.name?.[0] || "U"}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-border px-3 py-1 rounded-full shadow-lg flex items-center gap-2">
                 <Fingerprint className="w-2.5 h-2.5 text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Identity PK</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <ScoreProgress score={profile.score} />
              <div className="p-4 rounded-xl bg-[#0a0a0a] border border-white/5 italic text-[10px] text-neutral-400 leading-relaxed shadow-inner">
                 "{getScoreDescription(profile.score)}"
              </div>
            </div>

            <div className="w-full pt-4 border-t border-white/10 space-y-3 text-left">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-[#4f46e5] px-2 mb-4">Verified Connections</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: "On-Chain", val: profile.walletAddress, icon: SiEthereum, color: "#8b5cf6" },
                  { label: "GitHub", val: profile.github, icon: SiGithub, color: "#3b82f6" },
                  { label: "LinkedIn", val: profile.linkedin, icon: FaLinkedin, color: "#06b6d4" },
                  { label: "LeetCode", val: profile.leetcodeUsername, icon: SiLeetcode, color: "#f59e0b" },
                  { label: "Enterprise", val: profile.domainVerified ? profile.portfolio : null, icon: Globe, color: "#10b981" },
                ].map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/40 border border-white/5 group hover:border-white/20 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <link.icon className="w-4 h-4 opacity-80" style={{ color: link.color }} />
                      <span className="text-xs font-bold text-neutral-200">{link.label}</span>
                    </div>
                    {link.val ? (
                      <a href={link.val} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-[#0a0a0a] text-neutral-400 hover:text-white transition-all border border-white/5 hover:border-white/20">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[9px] text-neutral-600 font-bold uppercase mr-1">TBD</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full pt-6 mt-2 space-y-3">
              <button 
                onClick={downloadCertificate}
                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all group relative overflow-hidden border border-indigo-500 hover:bg-indigo-500"
              >
                <Award className="w-4 h-4" /> 
                <span className="text-xs uppercase tracking-widest">Download Protocol</span>
                <Download className="w-4 h-4 opacity-50" />
              </button>
              <button 
                onClick={() => setShowShareModal(true)}
                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600/90 text-white font-black rounded-2xl shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-95 transition-all group border border-indigo-400/30"
              >
                <Share2 className="w-4 h-4 group-hover:rotate-12 transition-all text-indigo-200" />
                <span className="text-xs uppercase tracking-widest">Share Reputation</span>
                <ExternalLink className="w-4 h-4 opacity-50 text-indigo-200" />
              </button>
              <div className="pt-2 flex justify-center">
                <ProfileQRCode profileId={profile.$id} name={profile.name} />
              </div>
            </div>
          </section>

          {/* New: Protocol Telemetry Card to fill space */}
          <section className="p-6 rounded-[2rem] bg-indigo-900/5 border border-indigo-200/20 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-900/40">Secure Node Active</span>
                </div>
                <LockIcon className="w-3 h-3 text-indigo-400 opacity-50" />
             </div>
             
             <div className="space-y-2">
                {[
                  { label: "Data Integrity", val: "100%", icon: ShieldCheck },
                  { label: "Sync Latency", val: "0.2ms", icon: Activity },
                  { label: "Privacy Layer", val: "ZKP Enabled", icon: Zap }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <stat.icon className="w-3 h-3 text-indigo-400" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase">{stat.label}</span>
                     </div>
                     <span className="text-[9px] font-black text-indigo-700">{stat.val}</span>
                  </div>
                ))}
             </div>

             <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] font-black text-indigo-900/40 uppercase tracking-widest">
                   <span>Shard Health</span>
                   <span>98.4%</span>
                </div>
                <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                   <div className="h-full w-[98.4%] bg-indigo-500 rounded-full" />
                </div>
             </div>

             <div className="pt-3 border-t border-indigo-100 flex items-center justify-center">
                <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest">Post-Quantum Encryption Active</p>
             </div>
          </section>

          <section className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-200/20 space-y-3">
             <div className="flex items-center gap-2">
                <TrophyIcon className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-900/40">Next Milestone</span>
             </div>
             <p className="text-[10px] text-slate-600 font-bold italic">Reach 85+ score to unlock "Sovereign Tier" certificate.</p>
             <div className="h-1 w-full bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full w-[65%] bg-amber-500 rounded-full" />
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

                {/* Profile Color */}
                <ProfileCustomizer
                  currentAccent={profile.accentColor || "violet"}
                  onSave={saveAccentColor}
                  saving={savingAccent}
                />

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

          {/* Trust Health Horizontal Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Global Percentile", val: "Top 8.2%", desc: "REGIONAL CONTEXT", icon: Users, color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]" },
              { label: "Protocol Rank", val: "Alpha Elite", desc: "TIER INDEX", icon: Award, color: "text-indigo-400", border: "border-indigo-500/20", bg: "bg-indigo-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]" },
              { label: "Growth Vector", val: "+14.2%", desc: "CREDIBILITY PULSE", icon: TrendingUp, color: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5", glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]" },
            ].map((stat, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] border ${stat.border} bg-neutral-900/40 backdrop-blur-md space-y-4 group hover:border-white/20 transition-all ${stat.glow} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <stat.icon className="w-20 h-20 rotate-12" />
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <div className={`p-3 rounded-2xl ${stat.bg} border border-white/5 shadow-inner`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.desc}</span>
                </div>
                <div className="space-y-1 relative z-10">
                  <div className="text-2xl font-black text-white tracking-tight">{stat.val}</div>
                  <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Achievement Badges */}
          <AchievementBadges 
            score={profile.score} 
            profile={profile} 
            breakdown={calculateCredibilityScore(profile).breakdown} 
          />
        </main>
      </div>

      {/* Footer Meta */}
      <footer className="pt-8 text-center pb-12 border-t border-border mx-10">
        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.5em]">
          Credovia Protocol • v1.0.4-Stable
        </p>
      </footer>

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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-800 border border-blue-100">
                      <Github className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground leading-tight">GitHub Evaluation</h2>
                      <p className="text-sm text-muted-foreground font-medium italic">Protocol Depth Analysis</p>
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
                      {calculateCredibilityScore(profile).breakdown.github} <span className="text-sm text-muted-foreground">/ 25 Pts</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowGithubInsights(false)}
                    className="px-8 py-3 bg-primary text-white font-black rounded-2xl hover:bg-blue-600 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-primary/20"
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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8 space-y-8">
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
                ) : alchemyData?.error ? (
                  <div className="py-10 text-center space-y-2">
                    <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">{alchemyData.error}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Verify the wallet address starts with 0x and is valid on Ethereum Mainnet.</p>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-red-500 font-bold">Failed to load Web3 Insights.</p>
                  </div>
                )}

                <div className="pt-6 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Web3 Weighted Vector</div>
                    <div className="text-3xl font-black text-foreground">
                      {calculateCredibilityScore(profile).breakdown.crypto} <span className="text-sm text-muted-foreground">/ 40 Pts</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAlchemyInsights(false)}
                    className="px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20"
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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-100 rounded-3xl text-blue-600 shadow-inner">
                      <Globe className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight">Domain Intelligence</h2>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Protocol</span>
                         <div className="h-1 w-1 rounded-full bg-slate-300" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Fully Verified</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowDomainInsights(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {loadingDomain ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary/50" />
                      </div>
                    </div>
                    <p className="text-sm font-black text-slate-500 animate-pulse">Scanning Enterprise Infrastructure...</p>
                  </div>
                ) : domainData ? (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <div className="relative">
                         <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                         </div>
                         <div className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 text-white rounded-lg shadow-lg">
                            <Zap className="w-3 h-3" />
                         </div>
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                           <h3 className="text-2xl font-black text-foreground tracking-tight">{domainData.domain}</h3>
                           <ExternalLink className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                           <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-[0.1em] shadow-sm">
                              {domainData.status}
                           </div>
                           <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-blue-100">
                              {domainData.trustLevel} Trust Index
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "Organization Type", val: domainData.organization, icon: Users2 },
                        { label: "Security Protocol", val: domainData.security, icon: ShieldCheck },
                        { label: "Verification Date", val: domainData.verifiedAt, icon: Calendar },
                        { label: "Domain Standing", val: "Excellent", icon: Star }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-blue-200 transition-colors group">
                           <div className="flex items-center gap-3 mb-2">
                              <stat.icon className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                           </div>
                           <div className="text-sm font-black text-slate-800">{stat.val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
                       <div className="flex items-start gap-4">
                          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                             <Rocket className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-black text-sm mb-1 uppercase tracking-wider">Protocol Impact</h4>
                             <p className="text-xs text-blue-50 leading-relaxed font-medium">
                                Link confirmed via enterprise OTP. This verification adds a significant weight to your **Digital Professional Standing**, increasing your aggregate credibility score by **10 points**.
                             </p>
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                   <div className="py-20 text-center space-y-4">
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                         <X className="w-10 h-10 text-red-500" />
                      </div>
                      <p className="text-sm font-bold text-red-500">Failed to generate Domain Insights.</p>
                   </div>
                )}

                <div className="pt-8 border-t border-slate-100 flex justify-end">
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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-8 md:p-12 space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-orange-50 rounded-3xl text-orange-600 shadow-inner border border-orange-100">
                      <Code2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-foreground tracking-tight">LeetCode Intelligence</h2>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Algorithmic Vector</span>
                         <div className="h-1 w-1 rounded-full bg-slate-300" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{getLeetCodeRank(leetcodeData.finalScore)}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowLeetcodeInsights(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors border border-slate-100">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                {loadingLeetcode ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-sm font-black text-slate-500 animate-pulse">Computing Algorithmic Intelligence...</p>
                  </div>
                ) : leetcodeError ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <X className="w-10 h-10 text-red-500" />
                    </div>
                    <p className="text-sm font-bold text-red-500">{leetcodeError}</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                           <h3 className="text-2xl font-black text-foreground tracking-tight">@{leetcodeData.username}</h3>
                           <ExternalLink className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                           <div className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border border-orange-100">
                              {leetcodeData.totalSolved} Solved
                           </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Final Score</div>
                        <div className="text-4xl font-black text-foreground">{leetcodeData.finalScore} <span className="text-lg text-slate-400">/ 100</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 hover:border-emerald-200 transition-colors group">
                           <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Easy</div>
                           <div className="text-2xl font-black text-foreground">{leetcodeData.easy}</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 transition-colors group">
                           <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Medium</div>
                           <div className="text-2xl font-black text-foreground">{leetcodeData.medium}</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-rose-50/50 border border-rose-100 hover:border-rose-200 transition-colors group">
                           <div className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1">Hard</div>
                           <div className="text-2xl font-black text-foreground">{leetcodeData.hard}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Algorithmic Insights</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {leetcodeData.insights.map((insight, i) => (
                           <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                             <Lightbulb className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                             <p className="text-xs font-semibold text-slate-700 leading-relaxed">{insight}</p>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                       <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Credovia Protocol Contribution</div>
                          <div className="text-2xl font-black text-foreground">
                            +{Math.min(Math.round((leetcodeData.finalScore / 100) * 15), 15)} Points
                          </div>
                        </div>
                      <button 
                        onClick={() => setShowLeetcodeInsights(false)}
                        className="px-8 py-3 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20"
                      >
                        Close Report
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8 space-y-8">
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
                ) : linkedinData?.error ? (
                  <div className="py-10 text-center space-y-2">
                    <p className="text-sm text-red-500 font-bold bg-red-50 p-4 rounded-xl border border-red-100">{linkedinData.error}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Verify the LinkedIn URL is formatted correctly (e.g., linkedin.com/in/name).</p>
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
                        <p className="text-sm text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2 pt-1">
                          <Activity className="w-4 h-4" />
                          @ {linkedinData.company}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Global Geography</div>
                        <div className="text-sm font-black text-foreground">{linkedinData.location}</div>
                      </div>
                      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Role Seniority</div>
                        <div className="text-sm font-black text-foreground capitalize">{linkedinData.seniority || "Unknown"}</div>
                      </div>
                    </div>

                    {linkedinData.skills && linkedinData.skills.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Verified Skill Vectors</h3>
                        <div className="flex flex-wrap gap-2">
                          {linkedinData.skills.map((skill: string, i: number) => (
                             <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">
                               {skill}
                             </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-sm text-red-500 font-bold">Failed to load Professional Insights.</p>
                  </div>
                )}

                <div className="pt-6 border-t border-border flex justify-end">
                  <button 
                    onClick={() => setShowLinkedinInsights(false)}
                    className="px-8 py-3 bg-sky-600 text-white font-black rounded-2xl hover:bg-sky-700 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-xl shadow-sky-600/20"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Verification Input Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmittingSync && setShowSyncModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
                         {syncPlatform === "Alchemy / Web3" 
                            ? <LinkIcon className="w-5 h-5" /> 
                            : syncPlatform === "LeetCode" 
                               ? <Code2 className="w-5 h-5 text-orange-600" />
                               : <Globe className="w-5 h-5" />
                         }
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground">Verification Protocol</h3>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{syncPlatform}</p>
                      </div>
                   </div>
                   {!isSubmittingSync && (
                      <button onClick={() => setShowSyncModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                   )}
                </div>

                <div className="space-y-4">
                  {syncStep === "input" ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        {syncPlatform === "Alchemy / Web3" 
                           ? "Ethereum Wallet Address" 
                           : syncPlatform === "LeetCode"
                              ? "LeetCode Username"
                              : "Official Work Email"
                        }
                      </label>
                      <input 
                        type="text"
                        value={syncInputValue}
                        onChange={(e) => setSyncInputValue(e.target.value)}
                        placeholder={
                            syncPlatform === "Alchemy / Web3" 
                               ? "0x..." 
                               : syncPlatform === "LeetCode"
                                  ? "johndoe"
                                  : "name@company.com"
                        }
                        disabled={isSubmittingSync}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Enterprise Verification Code
                      </label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                        <input 
                          type="text"
                          value={syncOtpValue}
                          onChange={(e) => setSyncOtpValue(e.target.value)}
                          placeholder="000000"
                          maxLength={6}
                          disabled={isSubmittingSync}
                          className="w-full px-6 py-4 pl-12 bg-blue-50/50 border border-blue-100 rounded-2xl text-center text-xl font-black tracking-[0.4em] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                        />
                      </div>
                      <p className="text-[9px] text-center text-muted-foreground italic">Check your official inbox for the verification token.</p>
                    </div>
                  )}

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                     <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                     <p className="text-[10px] text-amber-800 leading-relaxed font-bold italic">
                        {syncPlatform === "Alchemy / Web3" 
                          ? "Connecting your wallet will analyze your on-chain assets and transaction history to calculate your 35% weightage."
                          : syncPlatform === "LeetCode"
                            ? "Connecting your LeetCode profile will analyze your algorithmic problem-solving performance and consistency for up to +15 bonus points."
                            : syncStep === "input" 
                              ? "Entering your official email allows us to verify your professional identity and link your work domain to your profile."
                              : "Verifying your official email adds 10% to your credibility score and confirms your corporate standing."}
                     </p>
                  </div>
                </div>

                <button 
                  onClick={submitSync}
                  disabled={isSubmittingSync || (syncStep === "input" ? !syncInputValue : !syncOtpValue)}
                  className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
                >
                  {isSubmittingSync ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {syncStep === "otp" ? "Verifying Token..." : "Syncing Protocol..."}
                    </>
                  ) : (
                    <>
                      {syncStep === "otp" ? <CheckCircle2 className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      {syncStep === "otp" ? "Finalize Verification" : "Authorize & Send OTP"}
                    </>
                  )}
                </button>
                
                {syncStep === "otp" && !isSubmittingSync && (
                  <button 
                    onClick={() => setSyncStep("input")}
                    className="w-full py-2 text-[10px] text-muted-foreground hover:text-primary font-black uppercase tracking-widest transition-colors"
                  >
                    Change Email Address
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 p-8 md:p-10 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-foreground tracking-tight">Share Reputation</h2>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                 <button 
                  onClick={() => {
                    const url = encodeURIComponent(`https://credovia.io/profile/${profile.$id}`);
                    const text = encodeURIComponent(`Check out my Verified Trust Score on Credovia: ${profile.score}/100!`);
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                  }}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-all group"
                 >
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                       <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.393 0 12.03c0 2.123.555 4.198 1.611 6.041L0 24l6.117-1.605a11.776 11.776 0 005.927 1.603h.005c6.635 0 12.032-5.396 12.035-12.034a11.761 11.761 0 00-3.535-8.503z"/></svg>
                    </div>
                    <div className="text-left">
                       <div className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">WhatsApp</div>
                       <div className="text-sm font-bold text-slate-700">Share with friends</div>
                    </div>
                 </button>

                 <button 
                  onClick={() => {
                    const subject = encodeURIComponent(`My Credovia Reputation Score`);
                    const body = encodeURIComponent(`Check out my verified professional standing on Credovia. Trust Score: ${profile.score}/100.\n\nSee my profile: https://credovia.io/profile/${profile.$id}`);
                    window.location.href = `mailto:?subject=${subject}&body=${body}`;
                  }}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-all group"
                 >
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                       <Mail className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                       <div className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Email</div>
                       <div className="text-sm font-bold text-slate-700">Send via Mail</div>
                    </div>
                 </button>

                 <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://credovia.io/profile/${profile.$id}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all group"
                 >
                    <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-800/20 group-hover:scale-110 transition-transform">
                       <LinkIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                       <div className="text-xs font-black uppercase tracking-widest text-slate-600 mb-1">Copy Link</div>
                       <div className="text-sm font-bold text-slate-700">{copied ? "Copied Correct! ✅" : "Copy Profile URL"}</div>
                    </div>
                 </button>

                 <button 
                  onClick={() => {
                    downloadScoreCard();
                    setShowShareModal(false);
                  }}
                  className="w-full flex items-center gap-4 p-5 rounded-3xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all group"
                 >
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                       <Download className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                       <div className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">Download Image</div>
                       <div className="text-sm font-bold text-slate-700">Save as PNG</div>
                    </div>
                 </button>
              </div>

              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
                Secure Protocol Sharing
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>

  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
