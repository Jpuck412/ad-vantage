"use client";

interface LightMeterProps {
  score: number;
  size?: "lg" | "sm";
}

function scoreColor(score: number): string {
  if (score >= 7.5) return "#7D9A6D";
  if (score >= 5) return "#B48A46";
  return "#B75545";
}

export function LightMeter({ score, size = "lg" }: LightMeterProps) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const color = scoreColor(score);
  const isLg = size === "lg";

  return (
    <div className="w-full">
      <div className="flex items-baseline gap-3">
        <span
          className={`font-mono font-bold tabular-nums leading-none ${
            isLg ? "text-7xl" : "text-3xl"
          }`}
          style={{ color }}
        >
          {score.toFixed(1)}
        </span>

        <span className={`font-mono text-muted ${isLg ? "text-xl" : "text-sm"}`}>
          / 10
        </span>
      </div>

      <div className="relative mt-3 h-2 w-full overflow-hidden bg-line">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />

        <div className="absolute inset-0 flex justify-between px-[1px] pointer-events-none">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="h-full w-px bg-ink/40" />
          ))}
        </div>
      </div>

      <div className="mt-1 flex justify-between font-mono text-[10px] tracking-wider text-muted">
        <span>WEAK</span>
        <span>STRONG</span>
      </div>
    </div>
  );
}
