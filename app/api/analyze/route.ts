import { NextRequest, NextResponse } from "next/server";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/prompt";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function isValidMediaType(
  type: string
): type is "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type);
}

function cleanJsonText(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
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

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error:
            "Only image files are supported. Upload a screenshot, image ad, thumbnail, or video key frame."
        },
        { status: 400 }
      );
    }

    const mediaType = file.type;

    if (!isValidMediaType(mediaType)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${mediaType}` },
        { status: 400 }
      );
    }

    const maxBytes = 8 * 1024 * 1024;

    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: "Image too large. Max 8MB." },
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

Analyze this ad creative. Respond with only the JSON object.`
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

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error("Analyze error:", err);

    const message = err instanceof Error ? err.message : "Analysis failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
