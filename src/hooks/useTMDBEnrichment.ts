"use client";

import { useState, useCallback } from "react";
import { TitlePoint, EnrichedTitlePoint } from "@/types/episode";
import {
  TMDBSearchResponse,
  getPosterUrl,
  getBackdropUrl,
  getGenreNames,
  extractYear,
} from "@/lib/tmdb";
import { cleanTitle } from "@/lib/episode-parser";

interface EnrichmentState {
  enrichedTitles: Map<string, EnrichedTitlePoint>;
  isEnriching: boolean;
  progress: number;
  total: number;
  failedCount: number;
}

const BATCH_SIZE = 5; // Concurrent requests (TMDB allows ~40/10s)

interface FetchResult {
  data: EnrichedTitlePoint;
  success: boolean;
}

async function fetchTMDB(title: TitlePoint, cache: Map<string, EnrichedTitlePoint>): Promise<FetchResult> {
  const cleanedTitle = cleanTitle(title.title);

  if (!cleanedTitle) {
    console.warn(`[TMDB] Empty title after cleaning: "${title.title}"`);
    return { data: title, success: false };
  }
  if (cache.has(cleanedTitle)) return { data: { ...title, ...cache.get(cleanedTitle) }, success: true };

  try {
    const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(cleanedTitle)}`);
    if (!response.ok) {
      console.warn(`[TMDB] API error for "${cleanedTitle}": ${response.status}`);
      return { data: title, success: false };
    }

    const data: TMDBSearchResponse = await response.json();
    if (!data.results?.length) {
      console.warn(`[TMDB] No results for "${cleanedTitle}"`);
      return { data: title, success: false };
    }

    const match = data.results[0];
    const isMovie = match.media_type === "movie";

    const enriched: EnrichedTitlePoint = {
      ...title,
      tmdbId: match.id,
      mediaType: match.media_type,
      posterUrl: getPosterUrl(match.poster_path),
      backdropUrl: getBackdropUrl(match.backdrop_path),
      overview: match.overview,
      rating: match.vote_average,
      releaseYear: extractYear(isMovie ? match.release_date : match.first_air_date),
      genres: getGenreNames(match.genre_ids, match.media_type),
    };

    cache.set(cleanedTitle, enriched);
    return { data: enriched, success: true };
  } catch (err) {
    console.warn(`[TMDB] Fetch error for "${cleanedTitle}":`, err);
    return { data: title, success: false };
  }
}

export function useTMDBEnrichment() {
  const [state, setState] = useState<EnrichmentState>({
    enrichedTitles: new Map(),
    isEnriching: false,
    progress: 0,
    total: 0,
    failedCount: 0,
  });

  const enrichTitles = useCallback(async (titles: TitlePoint[]): Promise<EnrichedTitlePoint[]> => {
    setState((s) => ({
      ...s,
      isEnriching: true,
      progress: 0,
      total: titles.length,
      failedCount: 0,
    }));

    const cache = new Map(state.enrichedTitles);
    const results: EnrichedTitlePoint[] = [];
    let failed = 0;

    // Process in batches
    for (let i = 0; i < titles.length; i += BATCH_SIZE) {
      const batch = titles.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((t) => fetchTMDB(t, cache)));
      batchResults.forEach((r) => {
        results.push(r.data);
        if (!r.success) {
          failed++;
          console.log(`[TMDB] Counted as failed: "${r.data.title}"`);
        }
      });
      setState((s) => ({ ...s, progress: Math.min(i + BATCH_SIZE, titles.length) }));
    }

    setState((s) => ({
      ...s,
      enrichedTitles: cache,
      isEnriching: false,
      failedCount: failed,
    }));

    if (failed > 0) {
      console.log(`[TMDB] Enrichment complete: ${results.length - failed} succeeded, ${failed} failed`);
    }

    return results;
  }, [state.enrichedTitles]);

  const clearCache = useCallback(() => {
    setState({
      enrichedTitles: new Map(),
      isEnriching: false,
      progress: 0,
      total: 0,
      failedCount: 0,
    });
  }, []);

  return {
    enrichTitles,
    clearCache,
    isEnriching: state.isEnriching,
    progress: state.progress,
    total: state.total,
    failedCount: state.failedCount,
  };
}
