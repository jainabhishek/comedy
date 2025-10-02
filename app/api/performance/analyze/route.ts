import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  SYSTEM_PROMPTS,
  analyzePerformancePrompt,
  ERROR_MESSAGES,
} from "@/lib/ai-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { performances } = body;

    if (!performances || !Array.isArray(performances) || performances.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid performances array" },
        { status: 400 }
      );
    }

    const prompt = analyzePerformancePrompt(performances);
    const systemPrompt = SYSTEM_PROMPTS["performance-analysis"];

    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1200,
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
    console.error("Error in /api/performance/analyze:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.API_ERROR }, { status: 500 });
  }
}
