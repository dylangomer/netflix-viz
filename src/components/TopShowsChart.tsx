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
            margin={{ top: 8, right: 16, bottom: 80, left: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="title"
              tick={{ fontSize: 11, angle: -45, textAnchor: "end" }}
              interval={0}
              height={80}
              tickFormatter={(t: string) => (t.length > 20 ? t.slice(0, 19) + "…" : t)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const { title, watched } = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 shadow-lg">
                    <p className="font-medium text-sm">{title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{watched} watches</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="watched" fill="#3b82f6" radius={[4, 4, 0, 0]} activeBar={{ fill: "#1d4ed8" }}>
              <LabelList dataKey="watched" position="top" fontSize={11} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
