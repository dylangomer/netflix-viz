import { NextRequest, NextResponse } from "next/server";
import { TMDBSearchResponse } from "@/lib/tmdb";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Query parameter required" }, { status: 400 });
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Use multi search to find both movies and TV shows
    const url = new URL(`${TMDB_BASE_URL}/search/multi`);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("query", query);
    url.searchParams.set("include_adult", "false");
    url.searchParams.set("language", "en-US");
    url.searchParams.set("page", "1");

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data: TMDBSearchResponse = await response.json();

    // Filter to only movies and TV shows (exclude people, etc.)
    const filtered = {
      ...data,
      results: data.results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
      ),
    };

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json(
      { error: "Failed to search TMDB" },
      { status: 500 }
    );
  }
}
