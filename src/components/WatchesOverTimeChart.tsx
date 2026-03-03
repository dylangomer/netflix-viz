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
import { TWO_YEARS_IN_DAYS, SIX_MONTHS_IN_DAYS, COLORS } from "@/lib/constants";
import { Card } from "./Card";

interface WatchesOverTimeChartProps {
  data: DayPoint[];
}

type AggregationMode = "day" | "week" | "month";

function getDefaultMode(data: DayPoint[]): AggregationMode {
  if (data.length < 2) return "day";

  const dates = data.map((d) => new Date(d.day).getTime());
  const earliest = Math.min(...dates);
  const latest = Math.max(...dates);
  const rangeInDays = (latest - earliest) / (1000 * 60 * 60 * 24);

  if (rangeInDays >= TWO_YEARS_IN_DAYS) return "month";
  if (rangeInDays >= SIX_MONTHS_IN_DAYS) return "week";
  return "day";
}

export default function WatchesOverTimeChart({ data }: WatchesOverTimeChartProps) {
  const defaultMode = useMemo(() => getDefaultMode(data), [data]);
  const [mode, setMode] = useState<AggregationMode | null>(null);
  const activeMode = mode ?? defaultMode;

  const chartData = useMemo(() => {
    if (activeMode === "day") return data;

    const grouped = new Map<string, number>();

    data.forEach(({ day, watched }) => {
      const date = new Date(day);
      let key: string;

      if (activeMode === "week") {
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
      .sort((a, b) => {
        // Week keys are M/D/YY, month keys are M/YY
        const toDate = (k: string) => {
          const parts = k.split("/");
          return parts.length === 3
            ? new Date(k).getTime()
            : new Date(`${parts[0]}/1/${parts[1]}`).getTime();
        };
        return toDate(a.day) - toDate(b.day);
      });
  }, [data, activeMode]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Watches over time</h2>
        <div className="flex gap-1 text-sm">
          {(["day", "week", "month"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-2 py-1 rounded ${
                activeMode === m
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
                if (activeMode === "week") {
                  const start = new Date(day);
                  const end = new Date(start);
                  end.setDate(start.getDate() + 6);
                  dateLabel = `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}/${String(end.getFullYear()).slice(-2)}`;
                } else if (activeMode === "month") {
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
            <Line type="monotone" dataKey="watched" stroke={COLORS.primary} dot={chartData.length < 50} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
