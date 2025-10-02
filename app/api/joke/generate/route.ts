import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  SYSTEM_PROMPTS,
  validateComedyInput,
  generateSetupPrompt,
  generatePunchlinesPrompt,
  ERROR_MESSAGES,
} from "@/lib/ai-prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, content, context } = body;

    // Validate input
    if (!content || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!validateComedyInput(content)) {
      return NextResponse.json({ error: ERROR_MESSAGES.OFF_TOPIC }, { status: 400 });
    }

    let prompt = "";
    let systemPrompt = SYSTEM_PROMPTS["joke-generation"];

    if (type === "setup") {
      prompt = generateSetupPrompt(content);
    } else if (type === "punchline") {
      prompt = generatePunchlinesPrompt(content);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 500,
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
    const suggestions = JSON.parse(cleanedResponse);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in /api/joke/generate:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.API_ERROR }, { status: 500 });
  }
}
