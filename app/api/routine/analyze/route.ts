import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  SYSTEM_PROMPTS,
  analyzeRoutineFlowPrompt,
  suggestPlacementPrompt,
  ERROR_MESSAGES,
} from "@/lib/ai-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jokes, newJoke, requestPlacement } = body;

    if (!jokes || !Array.isArray(jokes)) {
      return NextResponse.json({ error: "Missing or invalid jokes array" }, { status: 400 });
    }

    let prompt: string;
    let systemPrompt: string;

    if (requestPlacement && newJoke) {
      // Suggest placement for new joke
      prompt = suggestPlacementPrompt(newJoke, jokes);
      systemPrompt = SYSTEM_PROMPTS["routine-analysis"];
    } else {
      // Analyze existing routine
      prompt = analyzeRoutineFlowPrompt(jokes);
      systemPrompt = SYSTEM_PROMPTS["routine-analysis"];
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1500,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse JSON response (strip markdown code blocks if present)
    const cleanedResponse = responseContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const result = JSON.parse(cleanedResponse);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/routine/analyze:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.API_ERROR }, { status: 500 });
  }
}
