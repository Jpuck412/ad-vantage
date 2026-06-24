"use client";

import type { AttentionRegion } from "@/lib/types";

interface AttentionOverlayProps {
  imageUrl: string;
  regions: AttentionRegion[];
}

export function AttentionOverlay({ imageUrl, regions }: AttentionOverlayProps) {
  const sorted = [...regions].sort((a, b) => a.rank - b.rank);

  return (
    <div className="relative w-full overflow-hidden border border-line bg-black shadow-rustic">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Ad creative being analyzed"
        className="block h-auto w-full"
      />

      <div className="absolute inset-0">
        {sorted.map((region) => (
          <div
            key={`${region.label}-${region.rank}`}
            className="absolute border-2 border-signal"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`
            }}
          >
            <span className="absolute -left-1 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-signal font-mono text-xs font-bold text-ink">
              {region.rank}
            </span>

            <span className="absolute bottom-full left-0 mb-0 truncate bg-ink/90 px-1.5 py-0.5 font-mono text-[10px] text-signal whitespace-nowrap">
              {region.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
