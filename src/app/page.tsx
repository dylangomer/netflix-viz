// Client-side page component
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { RawRow, DayPoint, TitlePoint, EnrichedTitlePoint } from "@/types/episode";
import { COLORS, TOP_GENRES_LIMIT, MIN_EPISODES_FOR_TV } from "@/lib/constants";
import FileUpload from "@/components/FileUpload";
import WatchesOverTimeChart from "@/components/WatchesOverTimeChart";
import TopShowsChart from "@/components/TopShowsChart";
import GenreChart from "@/components/GenreChart";
import { useTMDBEnrichment } from "@/hooks/useTMDBEnrichment";
import { computeWrappedInsights } from "@/lib/wrapped-insights";
import { computeViewerAvatar } from "@/lib/viewer-avatar";
import WrappedPlayer from "@/components/wrapped/WrappedPlayer";
import { SLIDE_REGISTRY } from "@/components/wrapped/slide-registry";
import { cleanTitle, hasEpisodeMarkers } from "@/lib/episode-parser";

function deduplicateTitles(titles: TitlePoint[]): TitlePoint[] {
  // Pass 1: group by cleanTitle (handles Season/Episode keywords)
  const map = new Map<string, { watched: number; knownTV: boolean }>();
  titles.forEach(t => {
    if (!t.title) return;
    const cleaned = cleanTitle(t.title);
    if (!cleaned) return;
    const isTV = hasEpisodeMarkers(t.title);
    const existing = map.get(cleaned);
    if (existing) {
      existing.watched += t.watched;
      if (isTV) existing.knownTV = true;
    } else {
      map.set(cleaned, { watched: t.watched, knownTV: isTV });
    }
  });

  // Pass 2: merge entries sharing a "Base:" prefix (e.g. "Colony: Geronimo" + "Colony: Pilot")
  // Netflix often formats episodes as "Show: EpisodeName" without Season/Episode markers.
  // If 2+ distinct entries share the same prefix before the first colon, they're likely episodes.
  const colonGroups = new Map<string, string[]>();
  for (const key of map.keys()) {
    const colonIdx = key.indexOf(":");
    if (colonIdx <= 0) continue;
    const base = key.slice(0, colonIdx).trim();
    const group = colonGroups.get(base) ?? [];
    group.push(key);
    colonGroups.set(base, group);
  }

  for (const [base, members] of colonGroups) {
    if (members.length < 2) continue;
    // Skip if the base already exists as a standalone entry (e.g. "Narcos" + "Narcos: Mexico")
    // to avoid merging genuinely different shows
    if (map.has(base) && !members.includes(base)) continue;

    let totalWatched = 0;
    members.forEach(key => {
      totalWatched += map.get(key)!.watched;
      map.delete(key);
    });

    const existing = map.get(base);
    if (existing) {
      existing.watched += totalWatched;
      existing.knownTV = true;
    } else {
      map.set(base, { watched: totalWatched, knownTV: true });
    }
  }

  return Array.from(map.entries()).map(([title, { watched, knownTV }]) => ({
    title,
    watched,
    knownTV,
  }));
}

const DEFAULT_FALLBACK_DATE = "1/1/75";

export default function Home() {
  const [rows, setRows] = useState<RawRow[] | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [viewMode, setViewMode] = useState<"wrapped" | "dashboard">("wrapped");
  const [enrichedMovies, setEnrichedMovies] = useState<EnrichedTitlePoint[]>([]);
  const [enrichedTVShows, setEnrichedTVShows] = useState<EnrichedTitlePoint[]>([]);
  const { enrichTitles, clearCache, isEnriching, progress, total, failedCount } = useTMDBEnrichment();

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
    const dayMap = new Map<string, number>();
    const titleMap = new Map<string, number>();

    rows?.forEach((r) => {
      const title = (r["Title"] ?? "").toString().trim();
      const date = (r["Date"] ?? DEFAULT_FALLBACK_DATE).toString();
      dayMap.set(date, (dayMap.get(date) ?? 0) + 1);
      // Netflix redacts some show names, leaving orphaned ": Episode X" entries.
      // Count them in daily totals but skip for enrichment (no show to search).
      const hasShowName = title && /[a-zA-Z0-9]/.test(title[0]);
      if (hasShowName) titleMap.set(title, (titleMap.get(title) ?? 0) + 1);
    });

    const byDay: DayPoint[] = Array.from(dayMap.entries())
      .map(([day, watched]) => ({ day, watched }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

    const byTitle: TitlePoint[] = Array.from(titleMap.entries())
      .map(([title, watched]) => ({ title, watched }))
      .sort((a, b) => b.watched - a.watched);

    return { byDay, byTitle };
  }, [rows]);

  // Reset enriched data when rows change (new upload or clear)
  const enrichGeneration = useRef(0);
  useEffect(() => {
    enrichGeneration.current++;
    setEnrichedMovies([]);
    setEnrichedTVShows([]);
    clearCache();
  }, [rows, clearCache]);

  // Auto-enrich when data is loaded
  useEffect(() => {
    if (byTitle.length === 0 || isEnriching || enrichedMovies.length > 0 || enrichedTVShows.length > 0) return;

    const gen = enrichGeneration.current;
    const runEnrichment = async () => {
      const deduplicated = deduplicateTitles(byTitle);
      const result = await enrichTitles(deduplicated);
      if (gen !== enrichGeneration.current) return; // stale — user uploaded new data
      setEnrichedMovies(result.filter(t => t.mediaType === "movie"));
      setEnrichedTVShows(result.filter(t => t.mediaType === "tv" && t.watched >= MIN_EPISODES_FOR_TV));
    };

    runEnrichment();
  }, [byTitle, isEnriching, enrichedMovies.length, enrichedTVShows.length, enrichTitles]);

  const isDataReady = enrichedMovies.length > 0 || enrichedTVShows.length > 0;

  const allEnriched = useMemo(() => [...enrichedMovies, ...enrichedTVShows], [enrichedMovies, enrichedTVShows]);

  // Build stable genre-to-color mapping from all enriched data
  const genreColorMap = useMemo(() => {
    const allData = allEnriched;
    const genreMap = new Map<string, number>();
    allData.forEach((title) => {
      title.genres?.forEach((genre) => {
        genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1);
      });
    });
    const sorted = Array.from(genreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_GENRES_LIMIT);
    const colorMap = new Map<string, string>();
    sorted.forEach(([genre], i) => colorMap.set(genre, COLORS.palette[i % COLORS.palette.length]));
    return colorMap;
  }, [allEnriched]);

  const insights = useMemo(() => {
    if (!rows || !isDataReady) return null;
    return computeWrappedInsights(rows, enrichedMovies, enrichedTVShows);
  }, [rows, enrichedMovies, enrichedTVShows, isDataReady]);

  const avatar = useMemo(() => {
    if (!insights) return null;
    return computeViewerAvatar(insights);
  }, [insights]);

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
          <div className="flex gap-2">
            {isDataReady && (
              <button
                onClick={() => setViewMode((v) => (v === "wrapped" ? "dashboard" : "wrapped"))}
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                {viewMode === "wrapped" ? "Dashboard" : "Wrapped"}
              </button>
            )}
            <button
              onClick={toggleDark}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </header>

        <FileUpload onDataLoaded={setRows} />

        {rows && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <p className="opacity-80">Parsed {rows.length.toLocaleString()} rows.</p>
              <button
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
                onClick={() => setRows(null)}
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
              <p className={`text-xs ${failedCount > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400"}`}>
                Enriched {enrichedMovies.length} movies, {enrichedTVShows.length} TV shows
                {failedCount > 0 && ` (${failedCount} titles not found)`}
              </p>
            )}
            {!isEnriching && !isDataReady && byTitle.length > 0 && failedCount > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Could not fetch metadata from TMDB ({failedCount} titles failed). Check your connection and try re-uploading.
              </p>
            )}
          </div>
        )}

        {isDataReady && viewMode === "wrapped" && insights && avatar && (
          <WrappedPlayer insights={insights} avatar={avatar} slides={SLIDE_REGISTRY} onClose={() => setViewMode("dashboard")} />
        )}

        {isDataReady && viewMode === "dashboard" && (
          <>
            <section className="grid gap-6 md:grid-cols-2">
              <WatchesOverTimeChart data={byDay} />
              <TopShowsChart data={enrichedTVShows} genreColorMap={genreColorMap} />
            </section>
            <GenreChart data={allEnriched} genreColorMap={genreColorMap} />
          </>
        )}

        <footer className="text-xs opacity-70">
          Tip: Get your CSV from Netflix → Account → Profiles → Your Profile → Viewing activity → Download all.
        </footer>
      </div>
    </main>
  );
}
