// Display limits and filtering thresholds
export const TOP_GENRES_LIMIT = 10;
export const SHOWS_PER_PAGE = 8;
export const MIN_EPISODES_FOR_TV = 5;
export const MIN_WATCHES_FOR_TOP_MOVIE = 5;

// Date range thresholds (in days) for chart aggregation
export const TWO_YEARS_IN_DAYS = 730;
export const SIX_MONTHS_IN_DAYS = 180;

// Viewer avatar thresholds
export const BINGE_THRESHOLD = 50; // top show ≥ N episodes → Binge Machine
export const CINEPHILE_MOVIE_RATIO = 0.6; // movies > 60% of watches → Cinephile
export const GENRE_LOYALIST_RATIO = 0.4; // top genre ≥ 40% → Genre Loyalist
export const EXPLORER_MIN_GENRES = 6; // ≥ N genres each ≥ 5% → Explorer
export const EXPLORER_GENRE_MIN_PERCENT = 5;

// Theme colors
export const COLORS = {
  primary: "#3b82f6",
  palette: [
    "#3b82f6", // blue
    "#ef4444", // red
    "#22c55e", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#6366f1", // indigo
    "#84cc16", // lime
  ],
};
