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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setStatus("uploading");

    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);

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
    setImageUrl(null);
    setResult(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const busy = status === "uploading" || status === "analyzing";

  return (
    <main className="min-h-screen px-5 py-10 md:px-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-signal">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            Ad Clarity Next
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-paper md:text-5xl">
            Read your ad before you spend on it.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
            Upload an ad screenshot and get an expert AI read on attention
            flow, message clarity, CTA strength, and conversion readiness.
          </p>

          <div className="rustic-line mt-6 h-px w-full" />
        </header>

        {!imageUrl && (
          <div
            onDrop={onDrop}
            onDragOver={(event) => event.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="rustic-panel cursor-pointer p-12 text-center transition-transform hover:-translate-y-0.5 focus-ring md:p-16"
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
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={onInputChange}
            />

            <p className="font-mono text-sm uppercase tracking-[0.15em] text-paper">
              Drop image, or click to browse
            </p>

            <p className="mt-2 text-xs text-muted">
              PNG, JPG, WEBP, or GIF. Max 8MB.
            </p>
          </div>
        )}

        {imageUrl && status !== "done" && (
          <div className="space-y-4">
            <div className="overflow-hidden border border-line bg-black shadow-rustic">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Uploaded creative"
                className="block h-auto w-full"
              />
            </div>

            {busy && (
              <div className="rustic-panel flex items-center gap-2 p-4 font-mono text-xs text-signal">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-signal" />
                {status === "uploading"
                  ? "Uploading..."
                  : "Reading the creative..."}
              </div>
            )}

            {status === "error" && (
              <div className="border border-danger/40 bg-danger/10 p-4">
                <p className="font-mono text-xs text-danger">{error}</p>

                <button
                  onClick={reset}
                  className="mt-3 font-mono text-xs text-paper underline focus-ring"
                >
                  Try another image
                </button>
              </div>
            )}
          </div>
        )}

        {status === "done" && result && imageUrl && (
          <div className="space-y-8">
            <AttentionOverlay
              imageUrl={imageUrl}
              regions={result.attentionRegions}
            />

            <div className="rustic-panel p-6">
              <LightMeter score={result.overallScore} />

              <p className="mt-5 text-lg leading-snug text-paper">
                {result.oneLineVerdict}
              </p>
            </div>

            <div className="rustic-panel p-6">
              <h2 className="mb-2 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                Dimensions
              </h2>

              {result.dimensions.map((dimension) => (
                <DimensionRow key={dimension.key} dim={dimension} />
              ))}
            </div>

            <div className="rustic-panel p-6">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-muted">
                Fixes
              </h2>

              <ul className="space-y-2">
                {result.fixes.map((fix, index) => (
                  <li key={index} className="flex gap-3 text-sm text-paper">
                    <span className="shrink-0 font-mono text-signal">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="leading-relaxed">{fix}</span>
                  </li>
                ))}
              </ul>
            </div>

            {result.riskFlags.length > 0 && (
              <div className="border border-danger/40 bg-danger/10 p-6">
                <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-danger">
                  Risk Flags
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

            <button
              onClick={reset}
              className="font-mono text-xs uppercase tracking-wider text-muted underline hover:text-signal focus-ring"
            >
              Analyze another
            </button>
          </div>
        )}

        <footer className="mt-16 border-t border-line pt-6">
          <p className="font-mono text-[10px] leading-relaxed text-muted">
            Ad Clarity Next gives an AI-based expert visual read on creative
            performance signals. It is not biometric measurement, real
            eye-tracking, or neuroscience proof. Use it to catch weak creative
            before media spend.
          </p>
        </footer>
      </div>
    </main>
  );
}
