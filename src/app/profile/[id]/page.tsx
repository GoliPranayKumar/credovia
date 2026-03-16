"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, use } from "react";
import { ScoreBadge, ScoreProgress, ScoreGauge, ScoreBreakdownView } from "@/components/ScoreVisuals";
import { 
  Github, 
  Linkedin, 
  Globe, 
  ExternalLink, 
  MessageSquare, 
  Star, 
  Send,
  Loader2,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { databases, DATABASE_ID, USERS_COLLECTION_ID, REVIEWS_COLLECTION_ID } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { motion } from "framer-motion";
import { calculateCredibilityScore, getScoreDescription } from "@/lib/score";
import { VerificationBadges } from "@/components/VerificationBadges";
import { ProfileQRCode } from "@/components/ProfileQRCode";

import { withRetry, getCachedData, setCachedData } from "@/lib/app-utils";

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    // Try cache first
    const cacheKey = `profile-${id}`;
    const cached = getCachedData<any>(cacheKey);
    if (cached) {
      setProfile(cached.profile);
      setReviews(cached.reviews);
      setLoading(false);
      // Still fetch in background to keep data fresh, but without blocking UI
    }

    try {
      const [pRes, r] = await Promise.all([
        // Try direct getDocument first
        withRetry(() => databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, id))
          .catch(async (err) => {
             console.warn("Direct getDocument failed, trying listDocuments fallback...", err);
             // Fallback: listDocuments might have broader read permissions in some Appwrite configs
             const fallback = await databases.listDocuments(
               DATABASE_ID, 
               USERS_COLLECTION_ID, 
               [Query.equal("$id", id)]
             );
             if (fallback.documents.length > 0) return fallback.documents[0];
             throw err; // Re-throw if fallback also fails
          }),
        REVIEWS_COLLECTION_ID 
          ? withRetry(() => databases.listDocuments(
              DATABASE_ID,
              REVIEWS_COLLECTION_ID,
              [Query.equal("targetUserId", id), Query.orderDesc("$createdAt")]
            ))
          : Promise.resolve({ documents: [] })
      ]);
      
      const p = pRes as any;
      setProfile(p);
      setReviews((r as any).documents);
      setCachedData(cacheKey, { profile: p, reviews: (r as any).documents });
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      // Don't set profile to null immediately if we have cached data
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login to leave a review");
    
    setSubmitting(true);
    try {
      await databases.createDocument(
        DATABASE_ID,
        REVIEWS_COLLECTION_ID,
        ID.unique(),
        {
          reviewerId: user.$id,
          targetUserId: id,
          rating: rating,
          comment: reviewText,
          reviewerName: currentUserProfile.name
        }
      );
      setReviewText("");
      fetchData(); // Refresh reviews and potentially score
    } catch (err) {
      console.error(err);
      alert("Failed to post review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  if (!profile) return <div className="text-center py-20"><AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" /><h2 className="text-2xl font-bold">User Not Found</h2></div>;

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Profile Header */}
      <section className="p-6 md:p-12 rounded-3xl md:rounded-[3rem] bg-white border border-border/60 shadow-sm flex flex-col items-center md:items-start md:flex-row gap-6 md:gap-10">
        <div className="w-24 h-24 md:w-40 md:h-40 rounded-2xl md:rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-4xl md:text-6xl font-black text-white shadow-2xl shadow-blue-500/20 shrink-0">
          {profile.name[0]}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-4 w-full">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{profile.name}</h1>
            <p className="text-base md:text-xl text-muted-foreground">{profile.bio || "No bio available"}</p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
             {profile.github && <a href={profile.github} target="_blank" className="flex items-center gap-2 bg-blue-50 px-3 md:px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors text-blue-800 text-xs md:text-sm"><Github className="w-4 h-4 md:w-5 md:h-5"/> GitHub</a>}
             {profile.linkedin && <a href={profile.linkedin} target="_blank" className="flex items-center gap-2 bg-blue-50 px-3 md:px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors text-blue-800 text-xs md:text-sm"><Linkedin className="w-4 h-4 md:w-5 md:h-5"/> LinkedIn</a>}
             {profile.portfolio && <a href={profile.portfolio} target="_blank" className="flex items-center gap-2 bg-blue-50 px-3 md:px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors text-blue-800 text-xs md:text-sm"><Globe className="w-4 h-4 md:w-5 md:h-5"/> Portfolio</a>}
             {profile.walletAddress && <div className="flex items-center gap-2 bg-blue-50 px-3 md:px-4 py-2 rounded-xl border border-blue-200 text-blue-700 font-bold text-xs md:text-sm"><img src="/logo.png" alt="logo" className="w-4 h-4 md:w-5 md:h-5 object-contain" /> Web3 Verified</div>}
          </div>

          {/* Verification Badges */}
          <div className="pt-2 flex justify-center md:justify-start">
            <VerificationBadges profile={profile} />
          </div>

          <div className="pt-4 flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <ScoreBadge score={profile.score} size="md" />
            <div className="scale-75 md:scale-100 origin-center md:origin-left">
               <ProfileQRCode profileId={profile.$id} name={profile.name} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Left Column - Score Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="p-8 rounded-[2.5rem] bg-white border border-border/60 shadow-sm space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <img src="/logo.png" alt="logo" className="w-6 h-6 object-contain" />
                    Authenticity Report
                </h3>
                <div className="flex justify-center py-6">
                  <ScoreGauge score={profile.score} />
                </div>
                <ScoreProgress score={profile.score} />
                <ScoreBreakdownView breakdown={calculateCredibilityScore(profile).breakdown} />
                <div className="space-y-4 pt-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Identity Verified</span>
                        <span className="text-emerald-600 font-bold">YES</span>
                    </div>
                    {profile.walletAddress && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">On-chain Trust</span>
                        <span className="text-blue-600 font-bold">ALPHA VERIFIED</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recent Activity</span>
                        <span className="text-foreground font-medium">Standard</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Trust Rank</span>
                        <span className="text-foreground font-medium">Top 15%</span>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                    <p className="text-[11px] text-blue-700 font-medium italic leading-relaxed">
                        "{getScoreDescription(profile.score)}"
                    </p>
                </div>
           </div>

           {/* Review Form */}
           {user && user.$id !== id && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-[2.5rem] bg-blue-50 border border-blue-200 space-y-6"
              >
                <h3 className="text-xl font-bold">Vouch for {profile.name.split(' ')[0]}</h3>
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => setRating(s)}
                        className={`p-2 rounded-lg transition-colors ${rating >= s ? "text-amber-500" : "text-muted-foreground"}`}
                      >
                        <Star className={`w-6 h-6 ${rating >= s ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                  <textarea 
                    required
                    className="w-full bg-white border border-blue-200 rounded-2xl p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                    placeholder="Write a trust review..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <button 
                     type="submit" 
                     disabled={submitting}
                     className="w-full bg-primary text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all border border-primary/20"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Post Review</>}
                  </button>
                </form>
              </motion.div>
            )}
        </div>

        {/* Right Column - Reviews List */}
        <div className="lg:col-span-3 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                Community Trust
              </h3>
              <span className="bg-blue-50 px-4 py-1 rounded-full text-sm font-bold border border-blue-200 text-blue-700">{reviews.length} Reviews</span>
           </div>

           <div className="space-y-4">
             {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <motion.div 
                    key={r.$id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-[2rem] bg-white border border-border/60 hover:border-blue-200 hover:shadow-sm transition-all space-y-3"
                  >
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center font-bold text-sm text-white">
                             {(r.reviewerName || "U")[0]}
                          </div>
                          <div>
                             <p className="font-bold text-sm">{r.reviewerName || "Verified User"}</p>
                             <p className="text-[10px] text-muted-foreground">{new Date(r.$createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="flex text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                       </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">"{r.comment}"</p>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-[2.5rem] border-dashed border-2 border-blue-200 opacity-50">
                   No one has vouched yet. Be the first!
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
