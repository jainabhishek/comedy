import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  SYSTEM_PROMPTS,
  validateComedyInput,
  generateSetupPrompt,
  generatePunchlinesPrompt,
  buildStructurePartPrompt,
  ERROR_MESSAGES,
} from "@/lib/ai-prompts";
import { extractResponseText } from "@/lib/openai-response";
import { getStructureById } from "@/lib/structures";
import type { SelectedPartOption } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { type } = body;

    if (!type || typeof type !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "structure-part") {
      const { structureId, partId, premise, priorSelections } = body;

      if (!structureId || !partId || !premise) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      if (!validateComedyInput(premise)) {
        return NextResponse.json({ error: ERROR_MESSAGES.OFF_TOPIC }, { status: 400 });
      }

      const structure = getStructureById(String(structureId));
      if (!structure) {
        return NextResponse.json({ error: "Unknown structure" }, { status: 400 });
      }

      const part = structure.parts.find((entry) => entry.id === String(partId));
      if (!part) {
        return NextResponse.json({ error: "Unknown structure part" }, { status: 400 });
      }

      const safePriorSelections: SelectedPartOption[] = Array.isArray(priorSelections)
        ? priorSelections
            .map((selection: SelectedPartOption) => ({
              partId: String(selection.partId ?? ""),
              selected: Array.isArray(selection.selected)
                ? selection.selected.map((item) => String(item))
                : [],
              customInputs: Array.isArray(selection.customInputs)
                ? selection.customInputs.map((item) => String(item))
                : undefined,
            }))
            .filter((selection) => selection.partId.length > 0)
        : [];

      const prompt = buildStructurePartPrompt({
        structureId: structure.id,
        partId: part.id,
        premise: String(premise),
        priorSelections: safePriorSelections,
      });

      let result;
      try {
        result = await fetchSuggestions(prompt);
      } catch (error) {
        console.error(
          "OpenAI structure-part generation failed",
          {
            structureId: structure.id,
            partId: part.id,
            promptPreview: prompt.slice(0, 200),
          },
          error
        );
        throw error;
      }

      return NextResponse.json({
        suggestions: result.suggestions,
        structureId: structure.id,
        partId: part.id,
      });
    }

    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!validateComedyInput(content)) {
      return NextResponse.json({ error: ERROR_MESSAGES.OFF_TOPIC }, { status: 400 });
    }

    let prompt = "";
    if (type === "setup") {
      prompt = generateSetupPrompt(content);
    } else if (type === "punchline") {
      prompt = generatePunchlinesPrompt(content);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    let result;
    try {
      result = await fetchSuggestions(prompt);
    } catch (error) {
      console.error(
        "OpenAI classic generation failed",
        {
          type,
          promptPreview: prompt.slice(0, 200),
        },
        error
      );
      throw error;
    }

    return NextResponse.json({ suggestions: result.suggestions });
  } catch (error) {
    const isDev = process.env.NODE_ENV !== "production";
    const detail = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in /api/joke/generate:", error);
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.API_ERROR,
        detail: isDev ? detail : undefined,
      },
      { status: 500 }
    );
  }
}
function parseSuggestions(raw: string): string[] {
  const cleanedResponse = raw
    .replace(/```json\n?/gi, "")
    .replace(/```\n?/g, "")
    .trim();

  const tryParse = (): string[] => {
    try {
      const parsed = JSON.parse(cleanedResponse);
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

  const parsed = tryParse();
  if (parsed.length > 0) {
    return parsed;
  }

  return cleanedResponse
    .split(/\r?\n|•|\*/)
    .map((line) => line.replace(/^\s*[-–—]?\s*/, ""))
    .map((line) => line.replace(/^\d+[\).:-]?\s*/, ""))
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

async function fetchSuggestions(prompt: string) {
  let completion;
  try {
    completion = await openai.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: SYSTEM_PROMPTS["joke-generation"] }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: prompt }],
        },
      ],
      max_output_tokens: 3000,
    });
  } catch (apiError) {
    console.error("OpenAI request failed", { promptPreview: prompt.slice(0, 200) }, apiError);
    throw apiError;
  }

  const responseContent = extractResponseText(completion);
  if (!responseContent) {
    throw new Error("No response from AI");
  }

  const parsed = parseSuggestions(responseContent);
  if (parsed.length > 0) {
    return { suggestions: parsed };
  }

  throw new Error("Unable to derive suggestions from AI response");
}
