"use client";

import type { DimensionScore } from "@/lib/types";

function barColor(score: number): string {
  if (score >= 7.5) return "bg-good";
  if (score >= 5) return "bg-signal";
  return "bg-danger";
}

export function DimensionRow({ dim }: { dim: DimensionScore }) {
  return (
    <div className="border-b border-line py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-sans text-sm font-medium text-paper">
          {dim.label}
        </span>

        <span className="font-mono text-sm tabular-nums text-muted">
          {dim.score.toFixed(1)}
        </span>
      </div>

      <div className="mt-1.5 h-1 w-full bg-line">
        <div
          className={`h-full ${barColor(dim.score)}`}
          style={{ width: `${(dim.score / 10) * 100}%` }}
        />
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-muted">
        {dim.reasoning}
      </p>
    </div>
  );
}
