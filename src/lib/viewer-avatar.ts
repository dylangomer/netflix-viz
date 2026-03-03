import { WrappedInsights, ViewerAvatar } from "@/types/episode";
import {
  BINGE_THRESHOLD,
  CINEPHILE_MOVIE_RATIO,
  GENRE_LOYALIST_RATIO,
  EXPLORER_MIN_GENRES,
  EXPLORER_GENRE_MIN_PERCENT,
} from "@/lib/constants";

export function computeViewerAvatar(insights: WrappedInsights): ViewerAvatar {
  const { topTVShow, totalMovies, totalWatches, favoriteGenre, favoriteGenrePercent, genreBreakdown } = insights;

  // Binge Machine: top show ≥ 50 episodes
  if (topTVShow && topTVShow.watched >= BINGE_THRESHOLD) {
    return {
      archetype: "Binge Machine",
      emoji: "\u{1F525}",
      tagline: "One more episode? You watched the whole season in a night.",
      highlights: [
        `Watched ${topTVShow.watched} episodes of ${topTVShow.title}`,
        `${insights.totalTVEpisodes} total TV episodes`,
      ],
    };
  }

  // Cinephile: movies > 60% of total
  const movieRatio = totalWatches > 0 ? totalMovies / totalWatches : 0;
  if (movieRatio > CINEPHILE_MOVIE_RATIO) {
    return {
      archetype: "Cinephile",
      emoji: "\u{1F3AC}",
      tagline: "You don't watch TV \u2014 you curate a film festival.",
      highlights: [
        `${totalMovies} movies watched`,
        `Movies made up ${Math.round(movieRatio * 100)}% of your viewing`,
      ],
    };
  }

  // Genre Loyalist: top genre ≥ 40%
  if (favoriteGenre && favoriteGenrePercent >= GENRE_LOYALIST_RATIO * 100) {
    return {
      archetype: "Genre Loyalist",
      emoji: "\u{1F3AF}",
      tagline: `You know what you like, and it\u2019s ${favoriteGenre}.`,
      highlights: [
        `${favoriteGenre} made up ${favoriteGenrePercent}% of your watching`,
        `${insights.uniqueTitles} unique titles explored`,
      ],
    };
  }

  // Explorer: ≥ 6 genres each with ≥ 5%
  const diverseGenres = genreBreakdown.filter((g) => g.percent >= EXPLORER_GENRE_MIN_PERCENT);
  if (diverseGenres.length >= EXPLORER_MIN_GENRES) {
    return {
      archetype: "Explorer",
      emoji: "\u{1F30D}",
      tagline: "Your taste can\u2019t be boxed in. You watch everything.",
      highlights: [
        `Spread across ${diverseGenres.length} different genres`,
        `${insights.uniqueTitles} unique titles`,
      ],
    };
  }

  // Default: Casual Viewer
  return {
    archetype: "Casual Viewer",
    emoji: "\u{1F6CB}\uFE0F",
    tagline: "Netflix and actually chill \u2014 you watch at your own pace.",
    highlights: [
      `${insights.totalWatches} total watches`,
      `${insights.uniqueTitles} unique titles`,
    ],
  };
}
