"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { EnrichedTitlePoint, GenrePoint } from "@/types/episode";

interface GenreChartProps {
  data: EnrichedTitlePoint[];
}

const COLORS = [
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
];

export default function GenreChart({ data }: GenreChartProps) {
  const genreData = useMemo(() => {
    const genreMap = new Map<string, number>();

    data.forEach((title) => {
      if (!title.genres) return;
      title.genres.forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) ?? 0) + title.watched);
      });
    });

    const total = Array.from(genreMap.values()).reduce((a, b) => a + b, 0);

    const sorted: GenrePoint[] = Array.from(genreMap.entries())
      .map(([genre, watched]) => ({
        genre,
        watched,
        percentage: Math.round((watched / total) * 100),
      }))
      .sort((a, b) => b.watched - a.watched)
      .slice(0, 10); // Top 10 genres

    return sorted;
  }, [data]);

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
      <h2 className="text-lg font-semibold mb-3">Genre Distribution</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={genreData}
              dataKey="watched"
              nameKey="genre"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
            >
              {genreData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const { genre, watched, percentage } = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 shadow-lg">
                    <p className="font-medium text-sm">{genre}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {watched} watches ({percentage}%)
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
