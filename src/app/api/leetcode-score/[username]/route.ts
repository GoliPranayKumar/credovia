import { NextRequest, NextResponse } from "next/server";
import { getLeetCodeScore } from "@/lib/leetcode";

// Simple in-process rate limiter: max 30 req/min per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const limit = 30;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait 1 minute before retrying." },
      { status: 429 }
    );
  }

  const { username } = await params;

  // Basic input validation
  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { error: "Username parameter is required." },
      { status: 400 }
    );
  }

  const sanitized = username.trim().toLowerCase();

  if (!/^[a-zA-Z0-9_-]{1,50}$/.test(sanitized)) {
    return NextResponse.json(
      { error: "Invalid username format. Only alphanumeric, underscore, and hyphen allowed." },
      { status: 400 }
    );
  }

  try {
    const score = await getLeetCodeScore(sanitized);

    return NextResponse.json(score, {
      status: 200,
      headers: {
        // Cache at CDN/browser level for 1 hour
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err: any) {
    const message: string = err?.message ?? "Unknown error";

    // User not found
    if (message.includes("not found")) {
      return NextResponse.json(
        { error: `LeetCode user "${username}" not found.` },
        { status: 404 }
      );
    }

    // Timeout
    if (message.includes("timeout") || message.includes("abort")) {
      return NextResponse.json(
        { error: "LeetCode API timed out. Please try again shortly." },
        { status: 504 }
      );
    }

    // Generic fallback
    console.error("[leetcode-score] API error:", message);
    return NextResponse.json(
      { error: "Failed to fetch LeetCode data. The LeetCode API may be temporarily unavailable." },
      { status: 502 }
    );
  }
}
