export interface Profile {
  name: string;
  bio: string;
  github: string;
  linkedin: string;
  portfolio: string;
  walletAddress?: string;
  [key: string]: any;
}

export interface ScoreBreakdown {
  crypto: number;      // 40%
  github: number;      // 25%
  identity: number;    // 10%
  domain: number;      // 10%
  behavior: number;    // 10%
  peer: number;        // 5%
}

export function calculateCredibilityScore(profile: Profile, reviewCount: number = 0, averageRating: number = 0): { total: number, breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    crypto: 0,
    github: 0,
    identity: 0,
    domain: 0,
    behavior: 0,
    peer: 0
  };

  // 1. Crypto Wallet Analysis (Max 40 points)
  if (profile.walletAddress?.startsWith('0x')) {
    // Basic presence + mock factors for age/token diversity
    breakdown.crypto += 20; // Base score for connecting
    if (profile.walletAddress.length > 30) breakdown.crypto += 20; // Simulated high frequency/diversity
  }

  // 2. GitHub Activity (Max 25 points)
  if (profile.github?.includes('github.com')) {
    breakdown.github += 15; // Base presence
    if (profile.github.length > 20) breakdown.github += 10; // Simulated repo count/followers
  }

  // 3. Verified Identity (Google/Email) (Max 10 points)
  if (profile.email?.endsWith('.com') || profile.email?.endsWith('.io')) {
    breakdown.identity += 10;
  }

  // 4. ENS / Domain Ownership (Max 10 points)
  if (profile.walletAddress?.endsWith('.eth')) {
    breakdown.domain += 6;
  }
  if (profile.portfolio?.startsWith('http')) {
    breakdown.domain += 4;
  }
  if (breakdown.domain > 10) breakdown.domain = 10;

  // 5. Internal Platform Behavior (Max 10 points)
  if (profile.name) breakdown.behavior += 3;
  if (profile.bio && profile.bio.length > 10) breakdown.behavior += 4;
  if (profile.name && profile.bio) breakdown.behavior += 3; // Completeness bonus

  // 6. Peer Endorsements (Max 5 points)
  if (reviewCount > 0) {
    const peerScore = (averageRating / 5) * 5;
    breakdown.peer = Math.min(Math.round(peerScore), 5);
  }

  const total = Math.min(
    breakdown.crypto + breakdown.github + breakdown.identity + breakdown.domain + breakdown.behavior + breakdown.peer, 
    100
  );

  return { total, breakdown };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-indigo-400 border-indigo-400/20 bg-indigo-400/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
  if (score >= 75) return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10";
  if (score >= 50) return "text-blue-400 border-blue-400/20 bg-blue-400/10";
  if (score >= 30) return "text-amber-400 border-amber-400/20 bg-amber-400/10";
  return "text-slate-400 border-slate-500/20 bg-slate-500/10";
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
