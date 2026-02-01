"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Define the shape of each data point
type DayPoint = { day: string; watched: number };

// Props interface - what data does this component need?
interface WatchesOverTimeChartProps {
  data: DayPoint[];
}

export default function WatchesOverTimeChart({ data }: WatchesOverTimeChartProps) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <h2 className="mb-3 text-lg font-semibold">Watches per day</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="watched" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
