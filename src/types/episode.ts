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

// Aggregated viewing data by title for bar chart
export type TitlePoint = {
  title: string;
  watched: number;
};

// Title enriched with TMDB metadata
export type EnrichedTitlePoint = TitlePoint & {
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  posterUrl?: string | null;
  backdropUrl?: string | null;
  overview?: string;
  rating?: number; // 0-10
  releaseYear?: string;
  genres?: string[];
};
