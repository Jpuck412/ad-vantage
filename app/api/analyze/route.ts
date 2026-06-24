import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ANALYSIS_SYSTEM_PROMPT } from "@/lib/prompt";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

function isValidMediaType(
  type: string
): type is "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(type);
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY environment variable." },
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

    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
      max_tokens: 2000,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64
              }
            },
            {
              type: "text",
              text: "Analyze this ad creative. Respond with only the JSON object."
            }
          ]
        }
      ]
    });

    const textBlock = message.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Model returned no text analysis. Try again." },
        { status: 502 }
      );
    }

    const cleaned = textBlock.text
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");

    let parsed: AnalysisResult;

    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Could not parse model analysis. Try again." },
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
