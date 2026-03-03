"use client";

type ProgressBarProps = {
  total: number;
  current: number;
};

export default function ProgressBar({ total, current }: ProgressBarProps) {
  return (
    <div className="flex gap-1 px-4 pt-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-colors duration-300"
          style={{
            backgroundColor:
              i < current
                ? "rgba(255,255,255,0.9)"
                : i === current
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  );
}
