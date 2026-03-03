// TMDB API types and utilities
// Docs: https://developer.themoviedb.org/docs

export interface TMDBSearchResult {
  id: number;
  title?: string; // movies
  name?: string; // TV shows
  media_type: "movie" | "tv";
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string; // movies
  first_air_date?: string; // TV shows
  genre_ids: number[];
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

// Genre ID to name mappings from TMDB
export const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};

// Build full image URL from TMDB path
export function getPosterUrl(path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w342"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: "w300" | "w780" | "w1280" | "original" = "w780"): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// Normalize TV compound genres to match movie genre names
const TV_GENRE_NORMALIZATION: Record<string, string[]> = {
  "Action & Adventure": ["Action", "Adventure"],
  "Sci-Fi & Fantasy": ["Science Fiction", "Fantasy"],
  "War & Politics": ["War"],
};

export function getGenreNames(genreIds: number[], mediaType: "movie" | "tv"): string[] {
  const genreMap = mediaType === "movie" ? MOVIE_GENRES : TV_GENRES;
  const rawGenres = genreIds.map((id) => genreMap[id]).filter(Boolean);

  if (mediaType === "tv") {
    // Expand compound TV genres to normalized names
    return rawGenres.flatMap((genre) => TV_GENRE_NORMALIZATION[genre] ?? [genre]);
  }

  return rawGenres;
}

