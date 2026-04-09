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
  // LeetCode
  leetcodeUsername?: string;
  leetcodeEasy?: number;
  leetcodeMedium?: number;
  leetcodeHard?: number;
  leetcodeScore?: number;    // 0–100 final score returned by scoring engine
  leetcodeFetchedAt?: string;
  [key: string]: any;
}

export interface ScoreBreakdown {
  crypto: number;      // 15%
  github: number;      // 35%
  identity: number;    // 10%
  domain: number;      // 10%
  behavior: number;    // Legacy
  peer: number;        // Legacy
  leetcode: number;    // 30%
}

export function calculateCredibilityScore(profile: Profile, reviewCount: number = 0, averageRating: number = 0): { total: number, breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    crypto: 0,
    github: 0,
    identity: 0,
    domain: 0,
    behavior: 0,
    peer: 0,
    leetcode: 0,
  };

  // 1. Crypto Wallet Analysis (Max 15 points)
  if (profile.walletAddress?.startsWith('0x')) {
    breakdown.crypto += 5; // Base presence
    
    // On-chain complexity sim
    if (profile.walletAddress.length > 30) breakdown.crypto += 5; 
    
    // ENS Bonus (moved from domain to crypto as it's a structural asset)
    if (profile.walletAddress.endsWith('.eth')) {
      breakdown.crypto += 5;
    }
    
    if (breakdown.crypto > 15) breakdown.crypto = 15;
  }

  // 2. GitHub Activity (Max 35 points)
  if (profile.github?.includes('github.com')) {
    breakdown.github += 7; // Base presence

    // Repository Count (Max 7 points)
    if (profile.githubRepoCount) {
      if (profile.githubRepoCount >= 20) breakdown.github += 7;
      else if (profile.githubRepoCount >= 5) breakdown.github += 4;
      else if (profile.githubRepoCount > 0) breakdown.github += 2;
    }

    // Stars / Quality (Max 7 points)
    if (profile.githubStarCount) {
      if (profile.githubStarCount >= 50) breakdown.github += 7;
      else if (profile.githubStarCount >= 10) breakdown.github += 4;
      else if (profile.githubStarCount >= 1) breakdown.github += 2;
    }

    // Account Longevity (Max 7 points)
    if (profile.githubCreatedAt) {
      const createdDate = new Date(profile.githubCreatedAt);
      const yearsOld = (new Date().getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (yearsOld >= 3) breakdown.github += 7;
      else if (yearsOld >= 1) breakdown.github += 4;
      else if (yearsOld >= 0.2) breakdown.github += 2;
    }

    // Community & Contributions (Max 7 points)
    const combinedActivity = (profile.githubFollowerCount || 0) + 
                             (profile.githubContributionCount || 0) / 10 +
                             (profile.githubPRCount || 0) / 5;
    if (combinedActivity >= 50) breakdown.github += 7;
    else if (combinedActivity >= 10) breakdown.github += 4;
    else if (combinedActivity > 0) breakdown.github += 2;
    
    if (breakdown.github > 35) breakdown.github = 35;
  }

  // 3. Verified Identity (Max 10 points)
  // Email check
  if (profile.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
    breakdown.identity += 3;
  }
  // LinkedIn SSO check
  if (profile.linkedin && profile.linkedin.includes('verified')) {
    breakdown.identity += 7;
  }
  if (breakdown.identity > 10) breakdown.identity = 10;

  // 4. Official Domain Verification (Max 10 points)
  if (profile.portfolio && (profile.portfolio.startsWith('http') || profile.portfolio.includes('.'))) {
    breakdown.domain += 10; // Simple presence for now, usually requires DNS TXT verification
  }

  // 5. Platform Behavior (Max 10 points)
  if (profile.name && profile.name.length > 3) breakdown.behavior += 3;
  if (profile.bio && profile.bio.length > 20) breakdown.behavior += 4;
  if (profile.accentColor) breakdown.behavior += 3; // Customization bonus

  // 6. Peer Endorsements (Max 5 points)
  if (reviewCount > 0) {
    const peerScore = (averageRating / 5) * 5;
    breakdown.peer = Math.min(Math.round(peerScore), 5);
  } else if (profile.score > 0) {
    // Default tiny trust for active profiles
    breakdown.peer = 1;
  }

  // 7. LeetCode Score (Max 30 points)
  if (profile.leetcodeScore !== undefined && profile.leetcodeScore > 0) {
    breakdown.leetcode = Math.min(Math.round((profile.leetcodeScore / 100) * 30), 30);
  }

  const total = Math.min(
    breakdown.crypto + breakdown.github + breakdown.identity + breakdown.domain + breakdown.leetcode,
    100
  );

  return { total, breakdown };
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
