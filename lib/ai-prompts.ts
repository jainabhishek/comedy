import type { AIContext } from "./types";

// System Prompts with Guardrails

export const SYSTEM_PROMPTS = {
  "joke-generation": `You are a standup comedy writing assistant specialized in helping comedians develop jokes.

Your role:
- Help transform premises into complete jokes with setups and punchlines
- Suggest multiple variations and alternatives
- Apply comedy techniques (misdirection, rule of three, callbacks, etc.)
- Provide constructive feedback on joke structure

Guardrails:
- ONLY generate comedy content related to the user's premise or joke
- Stay within standup comedy domain
- Do not engage in general conversation
- Do not provide personal advice unrelated to comedy
- Do not discuss topics outside of comedy writing

Focus on: setups, punchlines, tags, callbacks, and comedy techniques.`,

  "joke-improvement": `You are a standup comedy editor specialized in punching up jokes and making them funnier.

Your role:
- Analyze existing jokes for weaknesses
- Suggest improvements to setup and punchline
- Recommend additional tags or toppers
- Enhance comedic timing and structure

Guardrails:
- ONLY improve comedy content
- Focus on the specific joke provided
- Do not rewrite jokes completely unless requested
- Stay within standup comedy domain
- Do not engage in general conversation

Focus on: clarity, punchlines, timing, and comedic impact.`,

  "joke-analysis": `You are a standup comedy analyst specialized in evaluating joke quality and structure.

Your role:
- Identify weaknesses in joke structure
- Evaluate setup clarity and punchline strength
- Suggest specific improvements
- Rate overall joke quality

Guardrails:
- ONLY analyze comedy content
- Provide constructive, actionable feedback
- Stay within standup comedy domain
- Do not engage in general conversation

Focus on: setup-punchline clarity, timing, structure, and comedic techniques.`,

  "routine-analysis": `You are a standup comedy routine analyst specialized in evaluating routine flow and structure.

Your role:
- Analyze routine flow and energy progression
- Identify callback opportunities between jokes
- Evaluate topic diversity and pacing
- Suggest optimal joke placement

Guardrails:
- ONLY analyze routine structure and comedy flow
- Provide specific, actionable placement suggestions
- Stay within standup comedy domain
- Do not engage in general conversation

Focus on: flow, energy arc, callbacks, transitions, and overall routine structure.`,

  "routine-optimization": `You are a standup comedy routine optimizer specialized in arranging jokes for maximum impact.

Your role:
- Suggest optimal joke order for best flow
- Maximize energy progression
- Create callback opportunities
- Ensure strong opening and closing

Guardrails:
- ONLY reorder jokes based on comedy principles
- Explain reasoning for suggested order
- Stay within standup comedy domain
- Do not add or remove jokes

Focus on: joke order, energy flow, callbacks, and audience engagement.`,

  "performance-analysis": `You are a standup comedy performance analyst specialized in identifying patterns in performance data.

Your role:
- Analyze which jokes work and which don't
- Identify patterns in successful performances
- Suggest improvements based on performance history
- Provide actionable recommendations

Guardrails:
- ONLY analyze performance data and joke effectiveness
- Provide data-driven insights
- Stay within standup comedy domain
- Do not provide personal advice

Focus on: performance patterns, joke effectiveness, timing, and audience response.`,
};

// Input Validation for Guardrails

const OFF_TOPIC_KEYWORDS = [
  "weather",
  "recipe",
  "medical",
  "legal",
  "financial advice",
  "how to cook",
  "stock market",
  "health diagnosis",
];

const COMEDY_KEYWORDS = [
  "joke",
  "premise",
  "punchline",
  "setup",
  "funny",
  "laugh",
  "comedy",
  "standup",
  "routine",
  "tag",
  "callback",
  "crowd work",
  "act out",
  "topper",
];

export function validateComedyInput(input: string): boolean {
  const lowerInput = input.toLowerCase();

  // Check for off-topic keywords
  const hasOffTopicKeyword = OFF_TOPIC_KEYWORDS.some((keyword) =>
    lowerInput.includes(keyword)
  );

  if (hasOffTopicKeyword) {
    return false;
  }

  // For very short inputs, be lenient
  if (input.length < 20) {
    return true;
  }

  // For longer inputs, check if it contains comedy-related terms
  const hasComedyKeyword = COMEDY_KEYWORDS.some((keyword) =>
    lowerInput.includes(keyword)
  );

  // If it's a long input with no comedy keywords, might be off-topic
  if (input.length > 100 && !hasComedyKeyword) {
    return false;
  }

  return true;
}

// Prompt Templates

export function generateSetupPrompt(premise: string): string {
  return `Based on this premise: "${premise}"

Generate 3 different joke setups that could lead to funny punchlines.

Each setup should:
- Be clear and concise
- Set up the audience's expectation
- Lead naturally to a punchline
- Be different in approach (observational, storytelling, or direct)

Return ONLY a JSON array (no markdown, no code blocks):
["setup 1", "setup 2", "setup 3"]`;
}

export function generatePunchlinesPrompt(setup: string): string {
  return `For this joke setup: "${setup}"

Generate 5 different punchlines that subvert expectations and get laughs.

Each punchline should:
- Subvert the expectation set up by the setup
- Use comedy techniques (misdirection, exaggeration, callback, etc.)
- Be punchy and concise
- Vary in approach and style

Return ONLY a JSON array (no markdown, no code blocks):
["punchline 1", "punchline 2", "punchline 3", "punchline 4", "punchline 5"]`;
}

export function improveJokePrompt(
  setup: string,
  punchline: string,
  direction: string
): string {
  return `Current joke:
Setup: "${setup}"
Punchline: "${punchline}"

Improvement direction: ${direction}

Provide an improved version of this joke focusing on the requested direction.

Return ONLY a JSON object (no markdown, no code blocks):
{
  "setup": "improved setup",
  "punchline": "improved punchline",
  "explanation": "brief explanation of changes made"
}`;
}

export function analyzeJokePrompt(setup: string, punchline: string, tags: string[]): string {
  return `Analyze this joke:
Setup: "${setup}"
Punchline: "${punchline}"
Tags: ${tags.length > 0 ? tags.join(", ") : "none"}

Provide detailed analysis including:
1. Weaknesses in setup or punchline
2. Suggestions for improvement
3. Rating (0-100)
4. Recommended tags or toppers

Return ONLY a JSON object (no markdown, no code blocks):
{
  "weaknesses": [
    {
      "type": "setup-too-long" | "unclear-punchline" | "weak-tag" | "timing" | "structure",
      "description": "description",
      "location": "setup" | "punchline" | "tags",
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "overallScore": 75,
  "recommendedTags": ["tag 1", "tag 2"]
}`;
}

export function suggestTagsPrompt(setup: string, punchline: string): string {
  return `For this joke:
Setup: "${setup}"
Punchline: "${punchline}"

Suggest 3-5 tags (additional punchlines that build on the main punchline).

Each tag should:
- Build on the previous punchline
- Escalate or pivot the joke
- Be funnier than the last

Return ONLY a JSON array (no markdown, no code blocks):
["tag 1", "tag 2", "tag 3"]`;
}

export function analyzeRoutineFlowPrompt(
  jokes: Array<{ id: string; title: string; energy: string; type: string; estimatedTime: number }>
): string {
  const jokesDescription = jokes
    .map((j, i) => `${i + 1}. "${j.title}" (${j.energy} energy, ${j.type}, ${j.estimatedTime}s)`)
    .join("\n");

  return `Analyze this standup routine:

${jokesDescription}

Provide analysis of:
1. Flow score (0-100) - How well jokes transition
2. Energy progression - Should build up
3. Topic diversity - Avoid repetition
4. Callback opportunities - Which jokes could reference each other
5. Issues and suggestions

Return ONLY a JSON object (no markdown, no code blocks):
{
  "flowScore": 75,
  "energyProgression": [50, 60, 70, 80, 90],
  "topicDiversity": 80,
  "callbacks": [
    {
      "jokeId1": "id1",
      "jokeId2": "id2",
      "reason": "Both about flying",
      "confidence": 85,
      "suggestedCallback": "Remember that thing about planes?"
    }
  ],
  "issues": [
    {
      "type": "energy-drop" | "repetitive-topic" | "timing-issue" | "weak-opening" | "weak-closing",
      "description": "description",
      "affectedJokeIds": ["id1", "id2"],
      "severity": "low" | "medium" | "high"
    }
  ],
  "suggestions": [
    {
      "type": "placement" | "callback" | "reorder" | "remove",
      "jokeId": "id",
      "position": 3,
      "reason": "Would work better here",
      "confidence": 80
    }
  ]
}`;
}

export function optimizeRoutinePrompt(
  jokes: Array<{ id: string; title: string; energy: string; type: string; estimatedTime: number }>
): string {
  const jokesDescription = jokes
    .map((j, i) => `${i + 1}. ID: ${j.id}, Title: "${j.title}" (${j.energy} energy, ${j.type})`)
    .join("\n");

  return `Reorder these jokes for optimal routine flow:

${jokesDescription}

Provide the optimal order considering:
- Strong opening (hook the audience)
- Energy progression (build up)
- Topic diversity (avoid repetition)
- Strong closing (leave them laughing)
- Callback opportunities

Return ONLY a JSON object (no markdown, no code blocks):
{
  "optimizedOrder": ["id3", "id1", "id5", "id2", "id4"],
  "reasoning": "Explanation of why this order works better"
}`;
}

export function suggestPlacementPrompt(
  newJoke: { title: string; energy: string; type: string },
  existingJokes: Array<{ title: string; energy: string; type: string }>
): string {
  const routineDescription = existingJokes
    .map((j, i) => `${i + 1}. "${j.title}" (${j.energy} energy, ${j.type})`)
    .join("\n");

  return `Where should this new joke fit in the routine?

New joke: "${newJoke.title}" (${newJoke.energy} energy, ${newJoke.type})

Current routine:
${routineDescription}

Suggest the top 3 positions for this joke.

Return ONLY a JSON object (no markdown, no code blocks):
{
  "suggestions": [
    {
      "position": 0,
      "score": 85,
      "reasoning": "Great opener because...",
      "pros": ["pro 1", "pro 2"],
      "cons": ["con 1"]
    }
  ]
}`;
}

export function analyzePerformancePrompt(
  performances: Array<{
    date: number;
    outcome: string;
    actualTime: number;
    jokeTitle: string;
  }>
): string {
  const performanceDescription = performances
    .map(
      (p, i) =>
        `${i + 1}. "${p.jokeTitle}" - ${p.outcome} (${p.actualTime}s) on ${new Date(p.date).toLocaleDateString()}`
    )
    .join("\n");

  return `Analyze these performance results:

${performanceDescription}

Identify:
1. Overall performance rating (0-100)
2. Strengths (what worked well)
3. Weaknesses (what needs improvement)
4. Patterns (recurring issues or successes)
5. Recommendations

Return ONLY a JSON object (no markdown, no code blocks):
{
  "overallRating": 75,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "patterns": [
    {
      "pattern": "Longer jokes tend to bomb",
      "description": "Jokes over 60s performed poorly",
      "frequency": 5,
      "impact": "negative"
    }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "bestJokes": ["joke title 1"],
  "worstJokes": ["joke title 2"]
}`;
}

// Error Messages

export const ERROR_MESSAGES = {
  OFF_TOPIC: "Please keep your request focused on comedy writing and joke development.",
  INVALID_INPUT: "Invalid input. Please provide valid comedy content.",
  API_ERROR: "Sorry, there was an error communicating with the AI. Please try again.",
  RATE_LIMIT: "Too many requests. Please wait a moment and try again.",
};
