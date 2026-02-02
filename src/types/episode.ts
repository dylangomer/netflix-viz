/**
 * Represents a single row from Netflix's ViewingActivity.csv export.
 * Fields are optional because they may be missing in the original CSV data.
 */
export type RawRow = {
  /** The title of the show/movie/episode */
  Title?: string;
  /** The date the content was watched (format: "M/D/YY") */
  Date?: string;
};

/**
 * Aggregated viewing data grouped by date.
 * Used for the "Watches per day" line chart.
 */
export type DayPoint = {
  /** Date string (format: "M/D/YY") */
  day: string;
  /** Number of items watched on this date */
  watched: number;
};

/**
 * Aggregated viewing data grouped by show/movie title.
 * Used for the "Top titles" bar chart.
 */
export type TitlePoint = {
  /** Show or movie name (extracted from full title) */
  title: string;
  /** Total number of times this title was watched */
  watched: number;
};