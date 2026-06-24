import { NextRequest, NextResponse } from "next/server";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/prompt";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SUPPORTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/mpeg"
];

function isSupportedMediaType(type: string): boolean {
  return SUPPORTED_TYPES.includes(type);
}

function cleanJsonText(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function normalizeRegions(result: AnalysisResult): AnalysisResult {
  const attentionRegions = Array.isArray(result.attentionRegions)
    ? result.attentionRegions.map((region, index) => ({
        label: String(region.label || `Region ${index + 1}`),
        x: Math.max(0, Math.min(96, Number(region.x) || 0)),
        y: Math.max(0, Math.min(96, Number(region.y) || 0)),
        width: Math.max(4, Math.min(100, Number(region.width) || 10)),
        height: Math.max(4, Math.min(100, Number(region.height) || 10)),
        rank: Number(region.rank) || index + 1
      }))
    : [];

  return {
    ...result,
    attentionRegions
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const mediaType = file.type;
    const isVideo = mediaType.startsWith("video/");
    const isImage = mediaType.startsWith("image/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Only image and video files are supported. Upload an ad screenshot, image ad, thumbnail, or short video creative."
        },
        { status: 400 }
      );
    }

    if (!isSupportedMediaType(mediaType)) {
      return NextResponse.json(
        { error: `Unsupported media type: ${mediaType}` },
        { status: 400 }
      );
    }

    const maxImageBytes = 8 * 1024 * 1024;
    const maxVideoBytes = 14 * 1024 * 1024;
    const maxBytes = isVideo ? maxVideoBytes : maxImageBytes;

    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Video too large. Max 14MB for free inline video testing."
            : "Image too large. Max 8MB."
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${ANALYSIS_SYSTEM_PROMPT}

Analyze this ${isVideo ? "video ad" : "image ad"} creative. Respond with only the JSON object.`
                },
                {
                  inline_data: {
                    mime_type: mediaType,
                    data: base64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message || "Gemini API request failed. Try again.";

      return NextResponse.json({ error: message }, { status: response.status });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      return NextResponse.json(
        { error: "Gemini returned no text analysis. Try again." },
        { status: 502 }
      );
    }

    let parsed: AnalysisResult;

    try {
      parsed = JSON.parse(cleanJsonText(text));
    } catch {
      return NextResponse.json(
        { error: "Could not parse Gemini analysis. Try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(normalizeRegions(parsed));
  } catch (err: unknown) {
    console.error("Analyze error:", err);

    const message = err instanceof Error ? err.message : "Analysis failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
