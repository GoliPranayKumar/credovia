// ============================================================
// LeetCode Scoring Engine — Credovia
// ============================================================

export interface LeetCodeRaw {
  easy: number;
  medium: number;
  hard: number;
}

export interface LeetCodeScore {
  username: string;
  easy: number;
  medium: number;
  hard: number;
  totalSolved: number;
  weightedScore: number;
  normalizedScore: number;
  consistencyScore: number;
  difficultyBonus: number;
  finalScore: number;           // 0–100
  insights: string[];
  fetchedAt: number;            // Unix ms
}

// ─── Benchmarks ────────────────────────────────────────────
const BENCHMARK_EASY   = 200;
const BENCHMARK_MEDIUM = 150;
const BENCHMARK_HARD   = 50;
const BENCHMARK_SCORE  =
  BENCHMARK_EASY * 1 + BENCHMARK_MEDIUM * 2.5 + BENCHMARK_HARD * 5; // 825

// ─── In-Memory Cache ───────────────────────────────────────
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry {
  data: LeetCodeScore;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getFromCache(username: string): LeetCodeScore | null {
  const entry = cache.get(username.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(username.toLowerCase());
    return null;
  }
  return entry.data;
}

function setCache(username: string, data: LeetCodeScore): void {
  cache.set(username.toLowerCase(), {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ─── LeetCode GraphQL Fetch ────────────────────────────────
const LEETCODE_GQL = "https://leetcode.com/graphql";

const GQL_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

async function fetchLeetCodeRaw(username: string): Promise<LeetCodeRaw> {
  const res = await fetch(LEETCODE_GQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com",
    },
    body: JSON.stringify({ query: GQL_QUERY, variables: { username } }),
    // 8-second timeout via AbortController
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API returned ${res.status}`);
  }

  const json = await res.json();

  const matchedUser = json?.data?.matchedUser;
  if (!matchedUser) {
    throw new Error(`User "${username}" not found on LeetCode`);
  }

  const stats: Array<{ difficulty: string; count: number }> =
    matchedUser.submitStats?.acSubmissionNum ?? [];

  const get = (diff: string) =>
    stats.find((s) => s.difficulty.toLowerCase() === diff)?.count ?? 0;

  return {
    easy:   get("easy"),
    medium: get("medium"),
    hard:   get("hard"),
  };
}

// ─── Scoring Engine ────────────────────────────────────────

function computeScore(username: string, raw: LeetCodeRaw): LeetCodeScore {
  const { easy, medium, hard } = raw;
  const totalSolved = easy + medium + hard;

  // Step 1: Weighted score
  const weightedScore = easy * 1 + medium * 2.5 + hard * 5;

  // Step 2: Normalized (0–100, capped)
  const normalizedScore = Math.min((weightedScore / BENCHMARK_SCORE) * 100, 100);

  // Step 3: Consistency score (simulated — deterministic from solve count)
  // Since LeetCode public API doesn't expose daily streaks, we simulate
  // consistency based on total solves spread over the last 90 days.
  // A realistic proxy: assume avg 2 problems/active day.
  const estimatedActiveDays = Math.min(totalSolved / 2, 90);
  const consistencyRatio = estimatedActiveDays / 90;
  const consistencyScore = Math.min(consistencyRatio * 100, 100);

  // Step 4: Difficulty bonus
  let difficultyBonus = 0;
  if (totalSolved > 0) {
    const hardRatio = hard / totalSolved;
    if (hardRatio > 0.3) difficultyBonus = 20;
    else if (hardRatio > 0.2) difficultyBonus = 10;
  }

  // Step 5: Final score
  const finalScore = Math.min(
    normalizedScore * 0.6 +
    consistencyScore * 0.2 +
    difficultyBonus * 0.2,
    100
  );

  // Step 6: Insights
  const insights = generateInsights({ easy, medium, hard, totalSolved, hardRatio: totalSolved > 0 ? hard / totalSolved : 0 });

  return {
    username,
    easy,
    medium,
    hard,
    totalSolved,
    weightedScore: Math.round(weightedScore * 10) / 10,
    normalizedScore: Math.round(normalizedScore * 10) / 10,
    consistencyScore: Math.round(consistencyScore * 10) / 10,
    difficultyBonus,
    finalScore: Math.round(finalScore * 10) / 10,
    insights,
    fetchedAt: Date.now(),
  };
}

function generateInsights(data: {
  easy: number;
  medium: number;
  hard: number;
  totalSolved: number;
  hardRatio: number;
}): string[] {
  const { easy, medium, hard, totalSolved, hardRatio } = data;
  const insights: string[] = [];

  if (totalSolved === 0) {
    insights.push("No problems solved yet. Start with easy problems to build momentum.");
    return insights;
  }

  // Volume insight
  if (totalSolved >= 500) insights.push("Exceptional volume — Top 5% of global LeetCode users.");
  else if (totalSolved >= 200) insights.push("Strong problem count — solid foundation established.");
  else if (totalSolved >= 50) insights.push("Decent solve count — focus on increasing medium difficulty.");
  else insights.push("Early stage — consistency will unlock higher score tiers.");

  // Medium strength
  const mediumRatio = medium / totalSolved;
  if (mediumRatio > 0.5) insights.push("Strong in medium problems — great algorithmic thinking.");
  else if (mediumRatio < 0.2 && totalSolved > 20) insights.push("Needs more medium problems to build interview readiness.");

  // Hard difficulty
  if (hardRatio > 0.3) insights.push("Elite hard problem solver — exceptional problem-solving depth.");
  else if (hardRatio > 0.15) insights.push("Good hard problem ratio — keep pushing the upper tier.");
  else if (totalSolved > 50) insights.push("Needs improvement in hard problems to reach top rankings.");

  // Easy balance
  if (easy > medium + hard && totalSolved > 30) {
    insights.push("Over-indexed on easy problems — shift focus to medium/hard.");
  }

  return insights;
}

// ─── Public API ────────────────────────────────────────────

/**
 * Fetch and score a LeetCode user. Uses in-memory cache (TTL 6h).
 * Throws descriptive errors on invalid username or API failure.
 */
export async function getLeetCodeScore(username: string): Promise<LeetCodeScore> {
  const cached = getFromCache(username);
  if (cached) return cached;

  const raw = await fetchLeetCodeRaw(username);
  const score = computeScore(username, raw);
  setCache(username, score);
  return score;
}

/**
 * Rank label based on finalScore.
 */
export function getLeetCodeRank(finalScore: number): string {
  if (finalScore >= 90) return "Grandmaster";
  if (finalScore >= 75) return "Expert";
  if (finalScore >= 55) return "Proficient";
  if (finalScore >= 35) return "Apprentice";
  return "Newcomer";
}

/**
 * Convert a LeetCode finalScore (0–100) to Credovia score contribution points.
 * Max contribution: 15 points (new "LeetCode" category).
 */
export function leetcodeScoreToCredoviaPoints(finalScore: number): number {
  return Math.round((finalScore / 100) * 15);
}
