"use client";

import { useState } from "react";
import { RawRow } from "@/types/episode";

interface FileUploadProps {
  onDataLoaded: (data: RawRow[]) => void;
}

// Netflix date format: M/D/YY (e.g. "3/4/19", "10/21/23")
const DATE_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;

/**
 * Parses a Netflix ViewingActivity.csv by splitting each line at the
 * LAST comma. This handles titles with commas correctly
 * (e.g. "13 Reasons Why: Season 1: Tape 7, Side A,3/4/19").
 */
function parseNetflixCSV(text: string): RawRow[] {
  const lines = text.split(/\r?\n/);
  if (lines.length === 0) return [];

  // Skip header row
  const startIdx = lines[0].toLowerCase().includes("title") ? 1 : 0;

  const rows: RawRow[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lastComma = line.lastIndexOf(",");
    if (lastComma === -1) continue;

    const date = line.slice(lastComma + 1).trim().replace(/^"|"$/g, "");
    const title = line.slice(0, lastComma).trim().replace(/^"|"$/g, "");

    if (!title || !DATE_RE.test(date)) continue;

    rows.push({ Title: title, Date: date });
  }

  return rows;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        setError("Failed to read file");
        return;
      }

      const rows = parseNetflixCSV(text);
      if (rows.length === 0) {
        setError("CSV file is empty or contains no valid data");
        return;
      }

      onDataLoaded(rows);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
      <label
        htmlFor="file"
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 hover:bg-gray-100/60 dark:hover:bg-gray-900"
      >
        <span className="text-base font-medium">Drag & drop CSV here, or click to choose</span>
        <span className="text-xs opacity-70">Only reads locally. No upload to a server.</span>
      </label>
      <input
        id="file"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}
