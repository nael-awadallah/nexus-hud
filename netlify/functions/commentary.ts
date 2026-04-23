import Anthropic from "@anthropic-ai/sdk";
import { buildFallbackCommentary } from "../../lib/ai/commentaryFallback";
import type { CommentaryResponse, CommentarySnapshot } from "../../lib/netlify/contracts";

const MODEL = process.env.AI_COMMENTARY_MODEL ?? "claude-sonnet-4-20250514";

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const snapshot = (await req.json()) as CommentarySnapshot;
  const fallback = buildFallbackCommentary(snapshot);
  const generatedAt = new Date().toISOString();

  try {
    const client = new Anthropic();
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 140,
      temperature: 0.6,
      system:
        "You are NEXUS-7, a cinematic AI HUD narrator. Write exactly 2 short sentences. Stay in-world, concise, and operational. Mention the most important anomaly or hotspot. Avoid markdown, bullets, and disclaimers.",
      messages: [
        {
          role: "user",
          content: `Telemetry snapshot:\n${JSON.stringify(snapshot, null, 2)}\n\nRespond with in-character operational commentary.`,
        },
      ],
    });

    const commentary =
      message.content
        .filter((item) => item.type === "text")
        .map((item) => item.text.trim())
        .join(" ")
        .trim() || fallback;

    const response: CommentaryResponse = {
      commentary,
      generatedAt,
      source: commentary === fallback ? "fallback" : "ai-gateway",
    };

    return Response.json(response, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch {
    const response: CommentaryResponse = {
      commentary: fallback,
      generatedAt,
      source: "fallback",
    };

    return Response.json(response, {
      headers: {
        "cache-control": "no-store",
      },
    });
  }
}
