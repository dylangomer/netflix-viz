// Frontend app - no server code here
"use client";

// React hooks for state management and memoization
import { useMemo, useState } from "react";
import { RawRow, DayPoint, TitlePoint } from "@/types/episode";
import FileUpload from "@/components/FileUpload";
import WatchesOverTimeChart from "@/components/WatchesOverTimeChart";
import TopShowsChart from "@/components/TopShowsChart";

export default function Home() {
  const [rows, setRows] = useState<RawRow[] | null>(null);

  const { byDay, byTitle } = useMemo(() => {
    // Fallback date for rows with missing date information
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

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Netflix Viewing Dashboard</h1>
          <p className="text-sm opacity-80">
            Upload your <code>ViewingActivity.csv</code>. We process it locally in your browser.
          </p>
        </header>

        <FileUpload onDataLoaded={setRows} />

        {rows && (
          <>
            <div className="flex items-center justify-between text-sm">
              <p className="opacity-80">Parsed {rows.length.toLocaleString()} rows.</p>
              <button
                className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-900"
                onClick={() => setRows(null)}
              >
                Clear data
              </button>
            </div>
          </>
        )}

        {rows && (
          <section className="grid gap-6 md:grid-cols-2">
            <WatchesOverTimeChart data={byDay} />
            <TopShowsChart data={byTitle} />
          </section>
        )}


        <footer className="text-xs opacity-70">
          Tip: Get your CSV from Netflix → Account → Profiles → Your Profile → Viewing activity → Download all.
        </footer>
      </div>
    </main>
  );
}
