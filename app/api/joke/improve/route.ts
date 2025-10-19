import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPTS, improveJokePrompt, ERROR_MESSAGES } from "@/lib/ai-prompts";
import { extractResponseText } from "@/lib/openai-response";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setup, punchline, direction } = body;

    if (!setup || !punchline || !direction) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = improveJokePrompt(setup, punchline, direction);
    const systemPrompt = SYSTEM_PROMPTS["joke-improvement"];

    const completion = await openai.responses.create({
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
      temperature: 0.7,
      max_output_tokens: 500,
    });

    const responseContent = extractResponseText(completion);

    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse JSON response (strip markdown code blocks if present)
    const cleanedResponse = responseContent
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const improved = JSON.parse(cleanedResponse);

    return NextResponse.json(improved);
  } catch (error) {
    console.error("Error in /api/joke/improve:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.API_ERROR }, { status: 500 });
  }
}
