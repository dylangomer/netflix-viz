"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { EnrichedTitlePoint } from "@/types/episode";

const DEFAULT_COLOR = "#3b82f6"; // fallback blue

interface GenreChartProps {
  data: EnrichedTitlePoint[];
  genreColorMap: Map<string, string>;
}

type FilterMode = "both" | "movies" | "tv";

interface GenreData {
  genre: string;
  count: number;
  movies: number;
  shows: number;
  percentage: number;
}


export default function GenreChart({ data, genreColorMap }: GenreChartProps) {
  const [mode, setMode] = useState<FilterMode>("both");

  const genreData = useMemo(() => {
    const genreMap = new Map<string, { movies: number; shows: number }>();

    data.forEach((title) => {
      if (!title.genres) return;
      if (mode === "movies" && title.mediaType !== "movie") return;
      if (mode === "tv" && title.mediaType !== "tv") return;

      title.genres.forEach((genre) => {
        const current = genreMap.get(genre) ?? { movies: 0, shows: 0 };
        if (title.mediaType === "movie") {
          current.movies++;
        } else {
          current.shows++;
        }
        genreMap.set(genre, current);
      });
    });

    const entries = Array.from(genreMap.entries());
    const total = entries.reduce((sum, [, v]) => sum + v.movies + v.shows, 0);
    if (total === 0) return [];

    const sorted: GenreData[] = entries
      .map(([genre, { movies, shows }]) => ({
        genre,
        count: movies + shows,
        movies,
        shows,
        percentage: Math.round(((movies + shows) / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return sorted;
  }, [data, mode]);

  if (genreData.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <h2 className="text-lg font-semibold mb-3">Genre Distribution</h2>
        <p className="text-sm opacity-70">No genre data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Genre Distribution</h2>
        <div className="flex gap-1">
          {(["both", "movies", "tv"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 text-xs rounded ${
                mode === m
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {m === "both" ? "Both" : m === "movies" ? "Movies" : "TV"}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={genreData}
              dataKey="count"
              nameKey="genre"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
            >
              {genreData.map((entry) => (
                <Cell key={entry.genre} fill={genreColorMap.get(entry.genre) ?? DEFAULT_COLOR} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const { genre, movies, shows, percentage } = payload[0].payload;
                const countText =
                  mode === "movies" ? `${movies} movies` :
                  mode === "tv" ? `${shows} shows` :
                  `${shows} shows, ${movies} movies`;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 shadow-lg">
                    <p className="font-medium text-sm">{genre}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {countText} ({percentage}%)
                    </p>
                  </div>
                );
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
