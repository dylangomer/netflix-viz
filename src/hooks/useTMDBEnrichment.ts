"use client";

import { useState, useCallback, useRef } from "react";
import { TitlePoint, EnrichedTitlePoint } from "@/types/episode";
import {
  TMDBSearchResponse,
  TMDBSearchResult,
  getPosterUrl,
  getBackdropUrl,
  getGenreNames,
} from "@/lib/tmdb";
import { cleanTitle } from "@/lib/episode-parser";

interface EnrichmentState {
  isEnriching: boolean;
  progress: number;
  total: number;
  failedCount: number;
}

const BATCH_SIZE = 5; // Concurrent requests (TMDB allows ~40/s)

interface FetchResult {
  data: EnrichedTitlePoint;
  success: boolean;
}

/** Single TMDB search call. Returns null on network/API error. */
async function queryTMDB(query: string): Promise<TMDBSearchResponse | null> {
  const resp = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
  return resp.ok ? resp.json() : null;
}

/**
 * Progressively strip colon segments and search until `predicate` matches a result.
 * Returns the matching result or null.
 */
async function searchWithColonFallback(
  query: string,
  predicate: (r: TMDBSearchResult) => boolean,
): Promise<TMDBSearchResult | null> {
  let shorter = query;
  while (shorter.includes(":")) {
    shorter = shorter.slice(0, shorter.lastIndexOf(":")).trim();
    if (!shorter) break;
    const data = await queryTMDB(shorter);
    const match = data?.results?.find(predicate);
    if (match) return match;
  }
  return null;
}

async function fetchTMDB(title: TitlePoint, cache: Map<string, EnrichedTitlePoint>): Promise<FetchResult> {
  const cleanedTitle = cleanTitle(title.title);

  if (!cleanedTitle) {
    console.warn(`[TMDB] Empty title after cleaning: "${title.title}"`);
    return { data: title, success: false };
  }
  if (cache.has(cleanedTitle)) return { data: { ...title, ...cache.get(cleanedTitle) }, success: true };

  try {
    // Initial search
    let data = await queryTMDB(cleanedTitle);

    // No results — progressively strip colon segments to find anything
    if (!data?.results?.length) {
      const fallback = await searchWithColonFallback(cleanedTitle, () => true);
      if (!fallback) {
        console.warn(`[TMDB] No results for "${cleanedTitle}"`);
        return { data: title, success: false };
      }
      // Wrap single result so downstream logic works uniformly
      data = { page: 1, results: [fallback], total_pages: 1, total_results: 1 };
    }

    // Pick best match: prefer TV for knownTV titles
    let match = data.results[0];
    if (title.knownTV) {
      const tvMatch =
        data.results.find((r) => r.media_type === "tv") ??
        (cleanedTitle.includes(":")
          ? await searchWithColonFallback(cleanedTitle, (r) => r.media_type === "tv")
          : null);
      if (tvMatch) match = tvMatch;
    }

    const enriched: EnrichedTitlePoint = {
      ...title,
      tmdbId: match.id,
      mediaType: match.media_type,
      posterUrl: getPosterUrl(match.poster_path),
      backdropUrl: getBackdropUrl(match.backdrop_path),
      rating: match.vote_average,
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
  const cacheRef = useRef(new Map<string, EnrichedTitlePoint>());
  const [state, setState] = useState<EnrichmentState>({
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

    const cache = cacheRef.current;
    const results: EnrichedTitlePoint[] = [];
    let failed = 0;

    // Process in batches
    for (let i = 0; i < titles.length; i += BATCH_SIZE) {
      const batch = titles.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((t) => fetchTMDB(t, cache)));
      batchResults.forEach((r) => {
        results.push(r.data);
        if (!r.success) failed++;
      });
      setState((s) => ({ ...s, progress: Math.min(i + BATCH_SIZE, titles.length) }));
    }

    setState((s) => ({
      ...s,
      isEnriching: false,
      failedCount: failed,
    }));

    return results;
  }, []);

  const clearCache = useCallback(() => {
    cacheRef.current = new Map();
    setState({
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
