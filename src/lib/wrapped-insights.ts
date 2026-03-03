import { RawRow, EnrichedTitlePoint, WrappedInsights } from "@/types/episode";

export function computeWrappedInsights(
  rows: RawRow[],
  enrichedMovies: EnrichedTitlePoint[],
  enrichedTVShows: EnrichedTitlePoint[],
): WrappedInsights {
  const allEnriched = [...enrichedMovies, ...enrichedTVShows];

  // Date range
  const dates = rows
    .map((r) => r.Date)
    .filter(Boolean)
    .map((d) => new Date(d!))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  const dateRange = {
    start: dates.length > 0 ? dates[0].toLocaleDateString() : "",
    end: dates.length > 0 ? dates[dates.length - 1].toLocaleDateString() : "",
  };

  // Totals
  const totalTVEpisodes = enrichedTVShows.reduce((s, t) => s + t.watched, 0);
  const totalMovies = enrichedMovies.reduce((s, t) => s + t.watched, 0);
  const totalWatches = rows.length;

  // Top TV show & movie (by watch count)
  const topTVShow =
    enrichedTVShows.length > 0
      ? enrichedTVShows.reduce((a, b) => (b.watched > a.watched ? b : a))
      : null;
  const topMovie =
    enrichedMovies.length > 0
      ? enrichedMovies.reduce((a, b) => (b.watched > a.watched ? b : a))
      : null;

  // Genre breakdown
  const genreCounts = new Map<string, number>();
  allEnriched.forEach((t) => {
    t.genres?.forEach((g) => {
      genreCounts.set(g, (genreCounts.get(g) ?? 0) + t.watched);
    });
  });
  const totalGenreHits = Array.from(genreCounts.values()).reduce((a, b) => a + b, 0) || 1;
  const genreBreakdown = Array.from(genreCounts.entries())
    .map(([genre, count]) => ({
      genre,
      count,
      percent: Math.round((count / totalGenreHits) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const favoriteGenre = genreBreakdown.length > 0 ? genreBreakdown[0].genre : null;
  const favoriteGenrePercent = genreBreakdown.length > 0 ? genreBreakdown[0].percent : 0;

  // Unique enriched titles
  const uniqueTitles = allEnriched.length;

  return {
    totalWatches,
    totalTVEpisodes,
    totalMovies,
    dateRange,
    topTVShow,
    topMovie,
    favoriteGenre,
    favoriteGenrePercent,
    genreBreakdown,
    uniqueTitles,
  };
}
