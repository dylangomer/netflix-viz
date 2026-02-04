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

    const enriched: EnrichedTitlePoint[] = [];
    const cache = new Map(state.enrichedTitles);

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      const cleanedTitle = cleanTitleForSearch(title.title);

      // Skip empty titles
      if (!cleanedTitle) {
        enriched.push(title);
        setState((s) => ({ ...s, progress: i + 1 }));
        continue;
      }

      // Check cache first
      if (cache.has(cleanedTitle)) {
        enriched.push({
          ...title,
          ...cache.get(cleanedTitle),
        });
        setState((s) => ({ ...s, progress: i + 1 }));
        continue;
      }

      try {
        const response = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(cleanedTitle)}`
        );

        if (!response.ok) {
          // If API fails, just use the original title data
          enriched.push(title);
          continue;
        }

        const data: TMDBSearchResponse = await response.json();

        if (data.results && data.results.length > 0) {
          const match = data.results[0];
          const isMovie = match.media_type === "movie";

          const enrichedTitle: EnrichedTitlePoint = {
            ...title,
            tmdbId: match.id,
            mediaType: match.media_type,
            posterUrl: getPosterUrl(match.poster_path),
            backdropUrl: getBackdropUrl(match.backdrop_path),
            overview: match.overview,
            rating: match.vote_average,
            releaseYear: extractYear(
              isMovie ? match.release_date : match.first_air_date
            ),
            genres: getGenreNames(match.genre_ids, match.media_type),
          };

          cache.set(cleanedTitle, enrichedTitle);
          enriched.push(enrichedTitle);
        } else {
          enriched.push(title);
        }
      } catch (error) {
        console.error(`Failed to enrich "${title.title}":`, error);
        enriched.push(title);
      }

      setState((s) => ({ ...s, progress: i + 1 }));

      // Small delay to avoid rate limiting
      if (i < titles.length - 1) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    setState((s) => ({
      ...s,
      enrichedTitles: cache,
      isEnriching: false,
    }));

    return enriched;
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
