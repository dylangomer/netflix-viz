"use client";

import { useState } from "react";
import { RawRow } from "@/types/episode";
import { identifyShow } from "@/lib/episode-parser";
import Papa from "papaparse";

interface FileUploadProps {
  onDataLoaded: (data: RawRow[]) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File) {
    setError(null);
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: (result) => {
        if (result.errors?.length) {
          setError(result.errors[0].message);
          return;
        }

        if (!result.data || result.data.length === 0) {
          setError("CSV file is empty or contains no valid data");
          return;
        }

        const normalized: RawRow[] = result.data.map(r => ({
          Title: identifyShow(r.Title),
          Date: r.Date,
        }));
        onDataLoaded(normalized);
      },
      error: (err) => setError(err.message),
    });
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
