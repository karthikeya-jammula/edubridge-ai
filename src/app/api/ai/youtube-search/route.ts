// ============================================
// GET /api/ai/youtube-search?q=...
// Searches YouTube and returns the first video ID
// ============================================

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q");
    if (!query) {
      return NextResponse.json({ success: false, error: "Missing query parameter" }, { status: 400 });
    }

    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      console.error("[YouTube Search] Failed to fetch:", res.status);
      return NextResponse.json({ success: false, error: "YouTube search failed" }, { status: 502 });
    }

    const html = await res.text();

    // Extract video IDs from YouTube's response
    // YouTube embeds video data in the HTML as JSON — look for "videoId":"XXXXX"
    const videoIdMatches = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/g);

    if (!videoIdMatches || videoIdMatches.length === 0) {
      return NextResponse.json({ success: false, error: "No videos found" }, { status: 404 });
    }

    // Extract unique video IDs (skip duplicates, ads, etc.)
    const seen = new Set<string>();
    const videoIds: string[] = [];
    for (const match of videoIdMatches) {
      const id = match.replace('"videoId":"', "").replace('"', "");
      if (!seen.has(id)) {
        seen.add(id);
        videoIds.push(id);
      }
      if (videoIds.length >= 5) break; // Get top 5
    }

    const firstVideoId = videoIds[0];

    return NextResponse.json({
      success: true,
      data: {
        videoId: firstVideoId,
        embedUrl: `https://www.youtube.com/embed/${firstVideoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${firstVideoId}`,
        searchUrl,
        allVideoIds: videoIds,
      },
    });
  } catch (error: any) {
    console.error("[YouTube Search] Error:", error?.message || error);
    return NextResponse.json({ success: false, error: "YouTube search failed" }, { status: 500 });
  }
}
