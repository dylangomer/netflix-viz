// Frontend app - no server code here
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

const GENRE_COLORS = [
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
import { RawRow, DayPoint, TitlePoint, EnrichedTitlePoint } from "@/types/episode";
import FileUpload from "@/components/FileUpload";
import WatchesOverTimeChart from "@/components/WatchesOverTimeChart";
import TopShowsChart from "@/components/TopShowsChart";
import GenreChart from "@/components/GenreChart";
import { useTMDBEnrichment } from "@/hooks/useTMDBEnrichment";

export default function Home() {
  const [rows, setRows] = useState<RawRow[] | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [enrichedMovies, setEnrichedMovies] = useState<EnrichedTitlePoint[]>([]);
  const [enrichedTVShows, setEnrichedTVShows] = useState<EnrichedTitlePoint[]>([]);
  const { enrichTitles, isEnriching, progress, total } = useTMDBEnrichment();

  // Load saved theme preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      document.documentElement.classList.add("light");
    }
  }, []);

  function toggleDark() {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }

  const { byDay, byTitle } = useMemo(() => {
    const DEFAULT_FALLBACK_DATE = "1/1/75";
    const dayMap = new Map<string, number>();
    const titleMap = new Map<string, number>();

    rows?.forEach((r) => {
      const title = (r["Title"] ?? "").toString();
      const date = (r["Date"] ?? DEFAULT_FALLBACK_DATE).toString();
      dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
      titleMap.set(title, (titleMap.get(title) ?? 0) + 1);
    });

    const byDay: DayPoint[] = Array.from(dayMap.entries())
      .map(([day, watched]) => ({ day, watched }))
      .sort((a, b) => (a.day < b.day ? -1 : 1));

    const byTitle: TitlePoint[] = Array.from(titleMap.entries())
      .map(([title, watched]) => ({ title, watched }))
      .sort((a, b) => b.watched - a.watched);

    return { byDay, byTitle };
  }, [rows]);

  // Deduplicate and prepare titles for enrichment
  const deduplicateTitles = useCallback((titles: TitlePoint[]): TitlePoint[] => {
    const titleMap = new Map<string, number>();
    titles.forEach(t => {
      const colonIdx = t.title.indexOf(":");
      const afterColon = colonIdx > 0 ? t.title.slice(colonIdx + 1).trim().toLowerCase() : "";
      const looksLikeTV = afterColon.startsWith("season") ||
                          afterColon.startsWith("series") ||
                          afterColon.startsWith("episode") ||
                          afterColon.startsWith("part") ||
                          afterColon.startsWith("volume");
      const cleaned = looksLikeTV ? t.title.slice(0, colonIdx).trim() : t.title;
      titleMap.set(cleaned, (titleMap.get(cleaned) ?? 0) + t.watched);
    });
    return Array.from(titleMap.entries()).map(([title, watched]) => ({ title, watched }));
  }, []);

  // Auto-enrich when data is loaded
  useEffect(() => {
    if (byTitle.length === 0 || isEnriching || enrichedMovies.length > 0 || enrichedTVShows.length > 0) return;

    const runEnrichment = async () => {
      const deduplicated = deduplicateTitles(byTitle);
      const result = await enrichTitles(deduplicated);
      setEnrichedMovies(result.filter(t => t.mediaType === "movie"));
      setEnrichedTVShows(result.filter(t => t.mediaType === "tv" && t.watched >= 5));
    };

    runEnrichment();
  }, [byTitle, isEnriching, enrichedMovies.length, enrichedTVShows.length, deduplicateTitles, enrichTitles]);

  const isDataReady = enrichedMovies.length > 0 || enrichedTVShows.length > 0;

  // Build stable genre-to-color mapping from all enriched data
  const genreColorMap = useMemo(() => {
    const allData = [...enrichedMovies, ...enrichedTVShows];
    const genreMap = new Map<string, number>();
    allData.forEach((title) => {
      title.genres?.forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1);
      });
    });
    const sorted = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const colorMap = new Map<string, string>();
    sorted.forEach(([genre], i) => colorMap.set(genre, GENRE_COLORS[i % GENRE_COLORS.length]));
    return colorMap;
  }, [enrichedMovies, enrichedTVShows]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <header className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Netflix Viewing Dashboard</h1>
            <p className="text-sm opacity-80">
              Upload your <code>ViewingActivity.csv</code>. We process it locally in your browser.
            </p>
          </div>
          <button
            onClick={toggleDark}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
          >
            {isDark ? "Light" : "Dark"}
          </button>
        </header>

        <FileUpload onDataLoaded={setRows} />

        {rows && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <p className="opacity-80">Parsed {rows.length.toLocaleString()} rows.</p>
              <button
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
                onClick={() => {
                  setRows(null);
                  setEnrichedMovies([]);
                  setEnrichedTVShows([]);
                }}
              >
                Clear data
              </button>
            </div>
            {isEnriching && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs opacity-70">
                  <span>Fetching metadata from TMDB...</span>
                  <span>{progress} / {total}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-150"
                    style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
            {isDataReady && (
              <p className="text-xs text-green-600 dark:text-green-400">
                Enriched {enrichedMovies.length} movies, {enrichedTVShows.length} TV shows
              </p>
            )}
          </div>
        )}

        {isDataReady && (
          <>
            <section className="grid gap-6 md:grid-cols-2">
              <WatchesOverTimeChart data={byDay} />
              <TopShowsChart data={enrichedTVShows} genreColorMap={genreColorMap} />
            </section>
            <section className="grid gap-6 md:grid-cols-2">
              <GenreChart data={[...enrichedMovies, ...enrichedTVShows]} genreColorMap={genreColorMap} />
            </section>
          </>
        )}

        <footer className="text-xs opacity-70">
          Tip: Get your CSV from Netflix → Account → Profiles → Your Profile → Viewing activity → Download all.
        </footer>
      </div>
    </main>
  );
}
