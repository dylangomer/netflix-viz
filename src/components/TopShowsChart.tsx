"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { TitlePoint } from "@/types/episode";

// Props interface - what data does this component need?
interface TopShowsChartProps {
  data: TitlePoint[];
  pageSize?: number; // Optional - defaults to 8
}

export default function TopShowsChart({ data, pageSize = 8 }: TopShowsChartProps) {
  // Internal state - this component manages its own pagination
  const [page, setPage] = useState(0);

  // Validate and use pageSize (ensure it's positive)
  const validPageSize = pageSize > 0 ? pageSize : 8;

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(data.length / validPageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageData = data.slice(safePage * validPageSize, (safePage + 1) * validPageSize);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Top titles (by watches)</h2>
        <div className="flex items-center gap-2">
          <button
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            ◀ Prev
          </button>
          <span className="text-sm opacity-70">
            {safePage + 1} / {totalPages}
          </span>
          <button
            className="rounded border px-2 py-1 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
          >
            Next ▶
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pageData}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8, left: 180 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="title"
              tick={{ fontSize: 12 }}
              width={180}
              tickFormatter={(t: string) => (t.length > 40 ? t.slice(0, 39) + "…" : t)}
            />
            <Tooltip />
            <Bar dataKey="watched" radius={[6, 6, 6, 6]}>
              <LabelList dataKey="watched" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
