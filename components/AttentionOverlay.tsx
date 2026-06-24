"use client";

import type { AttentionRegion } from "@/lib/types";

interface AttentionOverlayProps {
  mediaUrl: string;
  mediaType?: string;
  regions: AttentionRegion[];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function AttentionOverlay({
  mediaUrl,
  mediaType = "image",
  regions
}: AttentionOverlayProps) {
  const sorted = [...regions].sort((a, b) => a.rank - b.rank);
  const isVideo = mediaType.startsWith("video/");

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-rustic">
      {isVideo ? (
        <video
          src={mediaUrl}
          controls
          muted
          playsInline
          className="block h-auto w-full"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl}
          alt="Ad creative being analyzed"
          className="block h-auto w-full"
        />
      )}

      <div className="pointer-events-none absolute inset-0">
        {sorted.map((region) => {
          const safeLabelX = clamp(region.x + 1, 1, 82);
          const safeLabelY = clamp(region.y + 1, 1, 92);

          return (
            <div key={`${region.label}-${region.rank}`}>
              <div
                className="absolute border-2 border-signal/90 shadow-emberGlow"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`
                }}
              />

              <div
                className="absolute flex max-w-[180px] items-center gap-1 rounded-md bg-ink/90 px-2 py-1 font-mono text-[10px] text-signal shadow-lift"
                style={{
                  left: `${safeLabelX}%`,
                  top: `${safeLabelY}%`
                }}
              >
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-signal text-[10px] font-bold text-ink">
                  {region.rank}
                </span>
                <span className="truncate">{region.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
