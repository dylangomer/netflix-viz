// Single row from Netflix's ViewingActivity.csv export
export type RawRow = {
  Title?: string;
  Date?: string; // format: "M/D/YY"
};

// Aggregated viewing data by date for line chart
export type DayPoint = {
  day: string; // format: "M/D/YY"
  watched: number;
};

// Aggregated viewing data by title
export type TitlePoint = {
  title: string;
  watched: number;
  knownTV?: boolean; // true if raw Netflix title had episode/season markers
};

// Title enriched with TMDB metadata
export type EnrichedTitlePoint = TitlePoint & {
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  posterUrl?: string | null;
  backdropUrl?: string | null;
  rating?: number; // 0-10
  genres?: string[];
};

// --- Wrapped experience types ---

export type AvatarArchetype =
  | "Binge Machine"
  | "Cinephile"
  | "Genre Loyalist"
  | "Explorer"
  | "Casual Viewer";

export type ViewerAvatar = {
  archetype: AvatarArchetype;
  emoji: string;
  tagline: string;
  highlights: string[];
};

export type WrappedInsights = {
  totalWatches: number;
  totalTVEpisodes: number;
  totalMovies: number;
  dateRange: { start: string; end: string };
  topTVShow: EnrichedTitlePoint | null;
  topMovie: EnrichedTitlePoint | null;
  favoriteGenre: string | null;
  favoriteGenrePercent: number;
  genreBreakdown: { genre: string; count: number; percent: number }[];
  uniqueTitles: number;
};

export type SlideConfig = {
  id: string;
  component: React.ComponentType<SlideProps>;
  shouldShow: (insights: WrappedInsights) => boolean;
};

export type SlideProps = {
  insights: WrappedInsights;
  avatar: ViewerAvatar;
};
