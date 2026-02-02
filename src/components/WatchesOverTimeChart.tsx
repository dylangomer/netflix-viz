"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DayPoint } from "@/types/episode";

interface WatchesOverTimeChartProps {
  data: DayPoint[];
}

type AggregationMode = "day" | "week" | "month";

export default function WatchesOverTimeChart({ data }: WatchesOverTimeChartProps) {
  const [mode, setMode] = useState<AggregationMode>("day");

  const chartData = useMemo(() => {
    if (mode === "day") return data;

    const grouped = new Map<string, number>();

    data.forEach(({ day, watched }) => {
      const date = new Date(day);
      let key: string;

      if (mode === "week") {
        // Get start of week (Sunday)
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}/${String(startOfWeek.getFullYear()).slice(-2)}`;
      } else {
        // Month
        key = `${date.getMonth() + 1}/${String(date.getFullYear()).slice(-2)}`;
      }

      grouped.set(key, (grouped.get(key) ?? 0) + watched);
    });

    return Array.from(grouped.entries())
      .map(([day, watched]) => ({ day, watched }))
      .sort((a, b) => (a.day < b.day ? -1 : 1));
  }, [data, mode]);

  // Auto-select aggregation for large datasets
  const recommendedMode = data.length > 90 ? "week" : data.length > 365 ? "month" : "day";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Watches over time</h2>
        <div className="flex gap-1 text-sm">
          {(["day", "week", "month"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded ${
                mode === m
                  ? "bg-blue-500 text-white"
                  : "border hover:bg-gray-100 dark:hover:bg-gray-900"
              }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const { day, watched } = payload[0].payload;

                let dateLabel = day;
                if (mode === "week") {
                  const start = new Date(day);
                  const end = new Date(start);
                  end.setDate(start.getDate() + 6);
                  dateLabel = `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}/${String(end.getFullYear()).slice(-2)}`;
                } else if (mode === "month") {
                  const [month, year] = day.split("/");
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  dateLabel = `${monthNames[parseInt(month) - 1]} 20${year}`;
                }

                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 shadow-lg">
                    <p className="font-medium text-sm">{dateLabel}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{watched} watches</p>
                  </div>
                );
              }}
            />
            <Line type="monotone" dataKey="watched" stroke="#3b82f6" dot={chartData.length < 50} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
