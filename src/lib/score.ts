import { databases, DATABASE_ID, USERS_COLLECTION_ID, REVIEWS_COLLECTION_ID } from "./appwrite";
import { Query } from "appwrite";

export interface Profile {
  name: string;
  bio: string;
  email?: string;
  github?: string;
  githubRepoCount?: number;
  githubStarCount?: number;
  githubFollowerCount?: number;
  githubFollowingCount?: number;
  githubGistCount?: number;
  githubContributionCount?: number;
  githubPRCount?: number;
  githubCreatedAt?: string;
  linkedin?: string;
  portfolio?: string;
  walletAddress?: string;
  [key: string]: any;
}

export interface ScoreBreakdown {
  crypto: number;      // 35%
  github: number;      // 25%
  identity: number;    // 15%
  domain: number;      // 10%
  behavior: number;    // 10%
  peer: number;        // 5%
}

export interface ReviewScore {
  rating: number;
  reviewerScore: number;
}

export function calculateCredibilityScore(profile: Profile, reviews: ReviewScore[] = []): { total: number, breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    crypto: 0,
    github: 0,
    identity: 0,
    domain: 0,
    behavior: 0,
    peer: 0
  };

  // 1. Crypto Wallet Analysis (Max 35 points)
  if (profile.walletAddress?.startsWith('0x')) {
    breakdown.crypto += 10; // Base presence

    // On-chain complexity sim
    if (profile.walletAddress.length > 30) breakdown.crypto += 15;

    // ENS Bonus (moved from domain to crypto as it's a structural asset)
    if (profile.walletAddress.endsWith('.eth')) {
      breakdown.crypto += 10;
    }

    if (breakdown.crypto > 35) breakdown.crypto = 35;
  }

  // 2. GitHub Activity (Max 20 points)
  if (profile.github?.includes('github.com')) {
    breakdown.github += 5; // Base presence

    // Repository Count (Max 5 points)
    if (profile.githubRepoCount) {
      if (profile.githubRepoCount >= 20) breakdown.github += 5;
      else if (profile.githubRepoCount >= 5) breakdown.github += 3;
      else if (profile.githubRepoCount > 0) breakdown.github += 1;
    }

    // Stars / Quality (Max 5 points)
    if (profile.githubStarCount) {
      if (profile.githubStarCount >= 50) breakdown.github += 5;
      else if (profile.githubStarCount >= 10) breakdown.github += 3;
      else if (profile.githubStarCount >= 1) breakdown.github += 1;
    }

    // Account Longevity (Max 5 points)
    if (profile.githubCreatedAt) {
      const createdDate = new Date(profile.githubCreatedAt);
      const yearsOld = (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsOld >= 3) breakdown.github += 5;
      else if (yearsOld >= 1) breakdown.github += 3;
      else if (yearsOld >= 0.2) breakdown.github += 1;
    }

    // Community & Contributions (Max 5 points)
    const combinedActivity = (profile.githubFollowerCount || 0) +
      (profile.githubContributionCount || 0) / 10 +
      (profile.githubPRCount || 0) / 5;
    if (combinedActivity >= 50) breakdown.github += 5;
    else if (combinedActivity >= 10) breakdown.github += 3;
    else if (combinedActivity > 0) breakdown.github += 1;

    if (breakdown.github > 25) breakdown.github = 25;
  }

  // 3. Verified Identity (Max 15 points)
  // Email check
  if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    breakdown.identity += 5;
  }
  // LinkedIn SSO check
  if (profile.linkedin && profile.linkedin.includes('verified')) {
    breakdown.identity += 10;
  }
  if (breakdown.identity > 15) breakdown.identity = 15;

  // 4. Official Domain Verification (Max 10 points)
  if (profile.portfolio && (profile.portfolio.startsWith('http') || profile.portfolio.includes('.'))) {
    breakdown.domain += 10; // Simple presence for now, usually requires DNS TXT verification
  }

  // 5. Platform Behavior (Max 10 points)
  if (profile.name && profile.name.length > 3) breakdown.behavior += 3;
  if (profile.bio && profile.bio.length > 20) breakdown.behavior += 4;
  if (profile.accentColor) breakdown.behavior += 3; // Customization bonus

  // 6. Peer Endorsements (Max 5 points)
  if (reviews.length > 0) {
    let totalWeight = 0;
    let weightedScoreSum = 0;

    reviews.forEach(review => {
      // Weight the reviewer's score from 0.1 to 1.0 based on their own credibility
      const weight = Math.max(0.1, review.reviewerScore / 100);
      totalWeight += weight;
      // Rating is 1-5, normalize to 0-5 scale
      const normalizedRating = (review.rating / 5) * 5;
      weightedScoreSum += normalizedRating * weight;
    });

    const peerScore = totalWeight > 0 ? (weightedScoreSum / totalWeight) : 0;
    // Add a bonus for having multiple credible endorsements
    const volumeBonus = Math.min(totalWeight, 2); // Up to 2 bonus points based on total weight

    breakdown.peer = Math.min(Math.round(peerScore + volumeBonus), 5);
  } else if (profile.score > 0) {
    // Default tiny trust for active profiles
    breakdown.peer = 1;
  }

  const total = Math.min(
    breakdown.crypto + breakdown.github + breakdown.identity + breakdown.domain + breakdown.behavior + breakdown.peer,
    100
  );

  return { total, breakdown };
}

export async function recalculateAndSyncScore(profileId: string, profileData: any, syncToDb: boolean = true) {
  try {
    const r = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [Query.equal("targetUserId", profileId)]
    );

    const reviewerIds = Array.from(new Set(r.documents.map(rev => rev.reviewerId)));
    const reviewers = await Promise.all(
      reviewerIds.map(rId => databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, rId).catch(() => null))
    );

    const reviewerScores: Record<string, number> = {};
    reviewers.forEach(rev => { if (rev && rev.score !== undefined) reviewerScores[rev.$id] = rev.score; });

    const enrichedReviews = r.documents.map(rev => ({
      ...rev,
      rating: rev.rating,
      reviewerScore: reviewerScores[rev.reviewerId] || 0
    }));

    const result = calculateCredibilityScore(profileData, enrichedReviews);

    if (syncToDb) {
      // Sync only score to avoid overwriting recent changes if profileData is just partial
      await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, profileId, { score: result.total });
    }

    return { ...result, enrichedReviews };
  } catch (error) {
    console.error("Error recalculating score:", error);
    return { total: profileData.score || 0, breakdown: calculateCredibilityScore(profileData).breakdown, enrichedReviews: [] };
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-500 border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
  if (score >= 75) return "text-violet-500 border-violet-400/20 bg-violet-400/10 shadow-[0_0_10px_rgba(139,92,246,0.15)]";
  if (score >= 50) return "text-cyan-500 border-cyan-400/20 bg-cyan-400/10";
  if (score >= 30) return "text-amber-500 border-amber-400/20 bg-amber-400/10";
  return "text-rose-400 border-rose-400/20 bg-rose-400/10";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Elite Protocol Rank";
  if (score >= 75) return "Highly Credible Entity";
  if (score >= 50) return "Verified Trusted Citizen";
  if (score >= 30) return "Establishing Presence";
  return "Protocol Newcomer";
}

export function getScoreDescription(score: number): string {
  if (score >= 90) return "Top-tier credibility with high-value on-chain assets and established history.";
  if (score >= 75) return "Exceptional verification across multiple social and technical platforms.";
  if (score >= 50) return "Solid reputation supported by active peer review and verified links.";
  if (score >= 30) return "Identity confirmed, currently building on-chain and social proof.";
  return "New identity. Connect accounts and verify wallet to increase trust rank.";
}
