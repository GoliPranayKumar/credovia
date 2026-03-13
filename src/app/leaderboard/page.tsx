"use client";

import { useEffect, useState } from "react";
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from "@/lib/appwrite";
import { Query } from "appwrite";
import { ScoreBadge } from "@/components/ScoreVisuals";
import { VerificationBadges } from "@/components/VerificationBadges";
import { Trophy, Medal, Loader2, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.orderDesc("score"), Query.limit(20)]
        );
        setUsers(res.documents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rankStyles: Record<number, { medal: string; ring: string; glow: string; label: string }> = {
    1: { medal: "text-amber-400", ring: "ring-amber-400/40", glow: "shadow-amber-400/20", label: "Gold" },
    2: { medal: "text-slate-400", ring: "ring-slate-400/40", glow: "shadow-slate-400/20", label: "Silver" },
    3: { medal: "text-orange-500", ring: "ring-orange-400/40", glow: "shadow-orange-400/20", label: "Bronze" },
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto min-h-[70vh]">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-black uppercase tracking-widest mb-2">
          <Crown className="w-3.5 h-3.5" />
          Global Rankings
        </div>
        <h1 className="text-5xl font-black tracking-tight">
          Trust <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Leaderboard</span>
        </h1>
        <p className="text-lg text-muted-foreground">Top 20 most credible identities on the protocol.</p>
      </div>

      {/* Top 3 Podium */}
      {!loading && users.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 md:gap-4 items-end mb-8 px-2 md:px-0">
          {[users[1], users[0], users[2]].map((u, podiumIdx) => {
            const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
            const s = rankStyles[rank];
            const heights = ["h-24 md:h-28", "h-32 md:h-36", "h-20 md:h-24"];
            return (
              <motion.div
                key={u.$id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: podiumIdx * 0.15 }}
              >
                <Link href={`/profile/${u.$id}`} className="group block">
                  <div className="flex flex-col items-center gap-2 md:gap-3 mb-3">
                    <div className={cn(
                      "w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xl md:text-2xl font-black text-white shadow-xl ring-2 transition-all group-hover:scale-110",
                      s.ring, s.glow
                    )}>
                      {u.name[0]}
                    </div>
                    <div className="text-center w-full min-w-0">
                      <p className="font-black text-[10px] md:text-sm text-foreground truncate px-1">{u.name}</p>
                      <p className="text-[10px] md:text-xs font-black">
                        <span className={s.medal}>{u.score}</span>
                        <span className="text-muted-foreground hidden sm:inline"> pts</span>
                      </p>
                    </div>
                  </div>
                  <div className={cn(
                    "rounded-t-2xl flex items-center justify-center border border-b-0 bg-gradient-to-t from-muted/40 to-background shadow-inner",
                    heights[podiumIdx],
                    rank === 1 ? "border-amber-400/30" : rank === 2 ? "border-slate-400/30" : "border-orange-400/30"
                  )}>
                    <span className={cn("text-2xl md:text-3xl font-black", s.medal)}>#{rank}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="space-y-3 px-2 md:px-0">
        {loading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
          </div>
        ) : users.length > 0 ? (
          users.map((u, i) => {
            const rank = i + 1;
            const s = rankStyles[rank];
            return (
              <motion.div
                key={u.$id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/profile/${u.$id}`}
                  className="group flex items-center gap-3 md:gap-5 p-4 md:p-5 rounded-2xl bg-white border border-border/60 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/20 dark:bg-card transition-all"
                >
                  {/* Rank */}
                  <div className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-xs md:text-sm font-black shrink-0",
                    rank <= 3 ? `${s?.medal} bg-current/10` : "text-muted-foreground bg-muted/50"
                  )}>
                    {rank <= 3 ? (
                      <Medal className={cn("w-4 h-4 md:w-5 md:h-5", s?.medal)} />
                    ) : (
                      <span>{rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-lg md:text-xl font-black text-white shadow-md group-hover:scale-110 transition-transform shrink-0",
                      rank <= 3 ? `ring-2 ${s?.ring}` : ""
                    )}
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
                  >
                    {u.name[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm md:text-base text-foreground group-hover:text-violet-600 transition-colors truncate">
                      {u.name}
                    </h4>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{u.bio || "No bio"}</p>
                  </div>

                  {/* Verification + Score */}
                  <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    <div className="hidden lg:block">
                      <VerificationBadges profile={u} size="sm" />
                    </div>
                    <ScoreBadge score={u.score} size="sm" />
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-20 text-muted-foreground">No users found.</div>
        )}
      </div>
    </div>
  );
}
