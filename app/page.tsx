"use client";

import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import type { AnalysisResult } from "@/lib/types";
import { AttentionOverlay } from "@/components/AttentionOverlay";
import { DimensionRow } from "@/components/DimensionRow";
import { LightMeter } from "@/components/LightMeter";

type Status = "idle" | "uploading" | "analyzing" | "done" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setStatus("uploading");

    const previewUrl = URL.createObjectURL(file);
    setMediaUrl(previewUrl);
    setMediaType(file.type);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("analyzing");

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data as AnalysisResult);
      setStatus("done");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      setStatus("error");
    }
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const file = event.dataTransfer.files?.[0];

      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const reset = () => {
    setStatus("idle");
    setMediaUrl(null);
    setMediaType("");
    setResult(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const busy = status === "uploading" || status === "analyzing";
  const isVideo = mediaType.startsWith("video/");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-25" />
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-blueGlow/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] top-[8%] h-64 w-64 rounded-full bg-signal/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-8%] left-[30%] h-72 w-72 rounded-full bg-blueGlow/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <header className="panel-3d rounded-[28px] p-6 md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="chip-3d inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-blueGlow">
                <span className="inline-block h-2 w-2 rounded-full bg-signal shadow-emberGlow" />
                Ad Vantage
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
                <span className="hero-metal">Make your creative feel</span>
                <br />
                <span className="text-paper">worth spending money on.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-mist md:text-base">
                Upload an ad screenshot, image creative, thumbnail, or short
                video ad. Get a sharp AI read on attention flow, clarity,
                branding, CTA strength, and conversion readiness.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="chip-3d rounded-2xl px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Image + Video
                  </p>
                  <p className="mt-1 text-sm text-paper">
                    Analyze screenshots or clips
                  </p>
                </div>

                <div className="chip-3d rounded-2xl px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Creative Map
                  </p>
                  <p className="mt-1 text-sm text-paper">
                    Attention zones and flow
                  </p>
                </div>

                <div className="chip-3d rounded-2xl px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Fix List
                  </p>
                  <p className="mt-1 text-sm text-paper">
                    Specific changes, not fluff
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[420px]">
              <div className="panel-soft rounded-2xl p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Engine
                </p>
                <p className="mt-2 text-sm text-paper">
                  Visual creative intelligence
                </p>
              </div>

              <div className="panel-soft rounded-2xl p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Output
                </p>
                <p className="mt-2 text-sm text-paper">
                  Score, overlay, fixes
                </p>
              </div>

              <div className="panel-soft rounded-2xl p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  Style
                </p>
                <p className="mt-2 text-sm text-paper">
                  Steel blue + ember 3D
                </p>
              </div>
            </div>
          </div>

          <div className="rustic-line mt-8 h-px w-full" />
        </header>

        <section className="mt-8">
          {!mediaUrl && (
            <div
              onDrop={onDrop}
              onDragOver={(event) => event.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="drop-zone cursor-pointer rounded-[28px] p-10 text-center transition-transform duration-200 hover:-translate-y-1 md:p-16"
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  inputRef.current?.click();
                }
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/mpeg"
                className="hidden"
                onChange={onInputChange}
              />

              <div className="mx-auto max-w-2xl">
                <div className="chip-3d mx-auto inline-flex rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
                  Upload creative
                </div>

                <h2 className="mt-6 text-3xl font-semibold text-paper md:text-4xl">
                  Drop your ad here
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-mist md:text-base">
                  Use PNG, JPG, WEBP, GIF, MP4, WEBM, MOV, or MPEG. For video,
                  keep it short and lightweight so the free API can process it.
                </p>

                <div className="mt-8">
                  <span className="btn-3d inline-flex rounded-2xl px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-paper shadow-emberGlow">
                    Browse creative
                  </span>
                </div>
              </div>
            </div>
          )}

          {mediaUrl && status !== "done" && (
            <div className="space-y-4">
              <div className="panel-3d overflow-hidden rounded-[28px] p-4">
                {isVideo ? (
                  <video
                    src={mediaUrl}
                    controls
                    muted
                    playsInline
                    className="block h-auto w-full rounded-2xl border border-white/5"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl}
                    alt="Uploaded creative"
                    className="block h-auto w-full rounded-2xl border border-white/5"
                  />
                )}
              </div>

              {busy && (
                <div className="panel-soft flex items-center gap-3 rounded-2xl p-4 font-mono text-xs text-blueGlow">
                  <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-signal" />
                  {status === "uploading"
                    ? "Uploading creative..."
                    : isVideo
                      ? "Analyzing video structure..."
                      : "Analyzing visual structure..."}
                </div>
              )}

              {status === "error" && (
                <div className="rounded-2xl border border-danger/40 bg-danger/10 p-4">
                  <p className="font-mono text-xs text-danger">{error}</p>

                  <button
                    onClick={reset}
                    className="mt-3 font-mono text-xs text-paper underline focus-ring"
                  >
                    Try another creative
                  </button>
                </div>
              )}
            </div>
          )}

          {status === "done" && result && mediaUrl && (
            <div className="mt-2 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <div className="panel-3d rounded-[28px] p-4">
                  <AttentionOverlay
                    mediaUrl={mediaUrl}
                    mediaType={mediaType}
                    regions={result.attentionRegions}
                  />
                </div>

                <div className="panel-3d rounded-[28px] p-6">
                  <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-blueGlow">
                    Precision fixes
                  </h2>

                  <ul className="space-y-3">
                    {result.fixes.map((fix, index) => (
                      <li key={index} className="panel-soft rounded-2xl p-4">
                        <div className="flex gap-3">
                          <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-signal/15 font-mono text-xs text-signal">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <span className="text-sm leading-relaxed text-paper">
                            {fix}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.riskFlags.length > 0 && (
                  <div className="rounded-[28px] border border-danger/35 bg-danger/10 p-6 shadow-lift">
                    <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-danger">
                      Risk flags
                    </h2>

                    <ul className="space-y-2">
                      {result.riskFlags.map((flag, index) => (
                        <li
                          key={index}
                          className="text-sm leading-relaxed text-paper"
                        >
                          ⚠ {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="panel-3d rounded-[28px] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-blueGlow">
                        Overall read
                      </p>

                      <p className="mt-2 max-w-xs text-sm leading-relaxed text-mist">
                        Quick creative verdict with a stronger executive feel.
                      </p>
                    </div>

                    <div className="chip-3d rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                      Spend signal
                    </div>
                  </div>

                  <div className="mt-6">
                    <LightMeter score={result.overallScore} />
                  </div>

                  <p className="mt-6 text-lg leading-snug text-paper">
                    {result.oneLineVerdict}
                  </p>
                </div>

                <div className="panel-3d rounded-[28px] p-6">
                  <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-blueGlow">
                    Dimension breakdown
                  </h2>

                  {result.dimensions.map((dimension) => (
                    <DimensionRow key={dimension.key} dim={dimension} />
                  ))}
                </div>

                <div className="panel-soft rounded-[28px] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                        Next move
                      </p>

                      <p className="mt-1 text-sm text-paper">
                        Upload another creative and compare.
                      </p>
                    </div>

                    <button
                      onClick={reset}
                      className="btn-3d rounded-2xl px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-paper focus-ring"
                    >
                      Analyze another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-10 panel-soft rounded-[24px] p-5">
          <p className="font-mono text-[10px] leading-relaxed text-muted">
            Ad Vantage provides AI-powered creative analysis for images and
            short video ads. It is not real eye-tracking, biometric
            measurement, or neuroscience proof. Use it to sharpen creative
            decisions before spending money on traffic.
          </p>
        </footer>
      </div>
    </main>
  );
}
