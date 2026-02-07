"use client";

import { useState, useCallback } from "react";
import { TitlePoint, EnrichedTitlePoint } from "@/types/episode";
import {
  TMDBSearchResponse,
  cleanTitleForSearch,
  getPosterUrl,
  getBackdropUrl,
  getGenreNames,
  extractYear,
} from "@/lib/tmdb";

interface EnrichmentState {
  enrichedTitles: Map<string, EnrichedTitlePoint>;
  isEnriching: boolean;
  progress: number;
  total: number;
  error: string | null;
}

const BATCH_SIZE = 5; // Concurrent requests (TMDB allows ~40/10s)

async function fetchTMDB(title: TitlePoint, cache: Map<string, EnrichedTitlePoint>): Promise<EnrichedTitlePoint> {
  const cleanedTitle = cleanTitleForSearch(title.title);

  if (!cleanedTitle) return title;
  if (cache.has(cleanedTitle)) return { ...title, ...cache.get(cleanedTitle) };

  try {
    const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(cleanedTitle)}`);
    if (!response.ok) return title;

    const data: TMDBSearchResponse = await response.json();
    if (!data.results?.length) return title;

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
    return enriched;
  } catch {
    return title;
  }
}

export function useTMDBEnrichment() {
  const [state, setState] = useState<EnrichmentState>({
    enrichedTitles: new Map(),
    isEnriching: false,
    progress: 0,
    total: 0,
    error: null,
  });

  const enrichTitles = useCallback(async (titles: TitlePoint[]): Promise<EnrichedTitlePoint[]> => {
    setState((s) => ({
      ...s,
      isEnriching: true,
      progress: 0,
      total: titles.length,
      error: null,
    }));

    const cache = new Map(state.enrichedTitles);
    const results: EnrichedTitlePoint[] = [];

    // Process in batches
    for (let i = 0; i < titles.length; i += BATCH_SIZE) {
      const batch = titles.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((t) => fetchTMDB(t, cache)));
      results.push(...batchResults);
      setState((s) => ({ ...s, progress: Math.min(i + BATCH_SIZE, titles.length) }));
    }

    setState((s) => ({
      ...s,
      enrichedTitles: cache,
      isEnriching: false,
    }));

    return results;
  }, [state.enrichedTitles]);

  const clearCache = useCallback(() => {
    setState({
      enrichedTitles: new Map(),
      isEnriching: false,
      progress: 0,
      total: 0,
      error: null,
    });
  }, []);

  return {
    enrichTitles,
    clearCache,
    isEnriching: state.isEnriching,
    progress: state.progress,
    total: state.total,
    error: state.error,
  };
}
