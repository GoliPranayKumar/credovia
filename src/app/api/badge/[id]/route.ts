import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { recalculateAndSyncScore } from '@/lib/score';

function getScoreColorHex(score: number): string {
    if (score >= 90) return "#10B981"; // Emerald
    if (score >= 75) return "#8B5CF6"; // Violet
    if (score >= 50) return "#06B6D4"; // Cyan
    if (score >= 30) return "#F59E0B"; // Amber
    return "#F43F5E"; // Rose
}

// Ensure the endpoint is dynamic and not statically cached by Next.js
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Fetch profile and dynamic score
    const p = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, resolvedParams.id);
    const { total: score } = await recalculateAndSyncScore(resolvedParams.id, p, false);
    
    const color = getScoreColorHex(score);

    const svg = `
<svg width="150" height="28" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.1" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect x="0" y="0" width="105" height="28" fill="#1e293b" fill-opacity="0.95" rx="6" />
  <rect x="101" y="0" width="49" height="28" fill="${color}" rx="6" />
  <rect x="101" y="0" width="8" height="28" fill="${color}" />
  <rect x="0" y="0" width="150" height="28" fill="url(#g)" rx="6" />
  
  <!-- Text -->
  <text x="12" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="bold" fill="#ffffff" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3)">Credovia Score</text>
  <text x="115" y="19" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="900" fill="#ffffff" style="text-shadow: 0 1px 2px rgba(0,0,0,0.5)">${score}</text>
</svg>
    `.trim();

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    console.error("Error generating badge:", error);
    return new NextResponse('User Profile Not Found', { status: 404 });
  }
}
