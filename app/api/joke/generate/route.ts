import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  SYSTEM_PROMPTS,
  validateComedyInput,
  generateSetupPrompt,
  generatePunchlinesPrompt,
  ERROR_MESSAGES,
} from "@/lib/ai-prompts";
import { extractResponseText } from "@/lib/openai-response";

type GenerationType = "setup" | "punchline";

function generateFallbackSuggestions(type: GenerationType, content: string): string[] {
  const idea = content.trim();
  if (!idea) {
    return [];
  }

  if (type === "setup") {
    return [
      `You ever notice ${idea}? Because I did—and now we're all uncomfortable together.`,
      `${idea}—which sounds normal until you realize how weird it actually is.`,
      `So I'm at ${idea}, and instantly I'm thinking: this is going to end in a punchline or a restraining order.`,
    ];
  }

  return [
    `Because apparently the American dream now comes with CAPTCHAs and a morality clause.`,
    `Which is wild, because the robots still want benefits and I'm still not allowed sick days.`,
    `So yeah, joke's on me—I outsourced my empathy and HR still called it downsizing.`,
  ];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content } = body;

    // Validate input
    if (!content || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!validateComedyInput(content)) {
      return NextResponse.json({ error: ERROR_MESSAGES.OFF_TOPIC }, { status: 400 });
    }

    let prompt = "";
    const systemPrompt = SYSTEM_PROMPTS["joke-generation"];

    if (type === "setup") {
      prompt = generateSetupPrompt(content);
    } else if (type === "punchline") {
      prompt = generatePunchlinesPrompt(content);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      const fallback = generateFallbackSuggestions(type as GenerationType, content);
      return NextResponse.json({ suggestions: fallback, source: "fallback" }, { status: 200 });
    }

    // Call OpenAI
    let completion;
    try {
      completion = await openai.responses.create({
        model: "gpt-5",
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: systemPrompt }],
          },
          {
            role: "user",
            content: [{ type: "input_text", text: prompt }],
          },
        ],
        temperature: 0.8,
        max_output_tokens: 500,
      });
    } catch (apiError) {
      console.error("OpenAI request failed, falling back to heuristics", apiError);
      const fallback = generateFallbackSuggestions(type as GenerationType, content);
      if (fallback.length > 0) {
        return NextResponse.json({ suggestions: fallback, source: "fallback" }, { status: 200 });
      }

      return NextResponse.json({ error: ERROR_MESSAGES.API_ERROR }, { status: 502 });
    }

    const responseContent = extractResponseText(completion);

    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse JSON response (strip markdown code blocks if present)
    const cleanedResponse = responseContent
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    const tryParseSuggestions = (text: string): string[] => {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          return parsed
            .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
            .filter((entry) => entry.length > 0);
        }
      } catch (parseError) {
        console.warn("Failed to parse AI response as JSON", parseError);
      }
      return [];
    };

    let suggestions = tryParseSuggestions(cleanedResponse);

    if (suggestions.length === 0) {
      const fallback = cleanedResponse
        .split(/\r?\n|•|\*/)
        .map((line) => line.replace(/^\s*[-–—]?\s*/, ""))
        .map((line) => line.replace(/^\d+[\).:-]?\s*/, ""))
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (fallback.length > 0) {
        console.warn("Using fallback suggestions parsed from AI text");
        suggestions = fallback.slice(0, 5);
      }
    }

    if (suggestions.length === 0) {
      console.error("AI response could not be parsed", cleanedResponse);
      return NextResponse.json({ error: ERROR_MESSAGES.API_ERROR }, { status: 502 });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in /api/joke/generate:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.API_ERROR }, { status: 500 });
  }
}
