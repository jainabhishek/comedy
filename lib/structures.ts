import type { JokeStructure } from "./types";

// Category definitions for organizing joke structures
export const STRUCTURE_CATEGORIES = [
  { id: "core", name: "Core Blueprints", description: "Foundational joke patterns" },
  { id: "wordplay", name: "Wordplay & Language", description: "Puns, double meanings, word flips" },
  {
    id: "comparison",
    name: "Comparison Engines",
    description: "Analogies, exaggeration, contrast",
  },
  { id: "narrative", name: "Narrative & Timing", description: "Story-based structures" },
  { id: "call-response", name: "Call-and-Response", description: "Question-answer formats" },
  { id: "topper", name: "Topper", description: "Stacking multiple punchlines" },
];

// All 21 comedy blueprint structures
export const JOKE_STRUCTURES: JokeStructure[] = [
  // CORE BLUEPRINTS (6)
  {
    id: "setup-punchline-incongruity",
    name: "Setup → Punchline (Incongruity)",
    category: "core",
    example: "I told my trainer I want abs by summer. He said, 'Try Photoshop.'",
    summary: "Classic structure: establish normal world, deliver surprising twist.",
    parts: [
      {
        id: "setup",
        label: "Setup",
        description: "Frame the premise and establish the expectation.",
        allowsMultiple: false,
      },
      {
        id: "punchline",
        label: "Punchline",
        description: "Deliver the incongruous twist that subverts the expectation.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "rule-of-three",
    name: "Rule of Three (A, B, Surprise-C)",
    category: "core",
    example: "My diet has three phases: denial, bargaining, and… tacos.",
    summary: "Two similar beats establish a pattern; third breaks it.",
    parts: [
      {
        id: "beat-a",
        label: "Beat A",
        description: "First item that establishes the pattern.",
        allowsMultiple: false,
      },
      {
        id: "beat-b",
        label: "Beat B",
        description: "Second item that reinforces the pattern.",
        allowsMultiple: false,
      },
      {
        id: "surprise-c",
        label: "Surprise C",
        description: "Third item that breaks the pattern for the laugh.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "misdirection-paraprosdokian",
    name: "Misdirection / Paraprosdokian",
    category: "core",
    example: "I have the body of a god—unfortunately, it's in my freezer.",
    summary: "Lead the audience to one meaning; reveal a second.",
    parts: [
      {
        id: "garden-path",
        label: "Garden Path Setup",
        description: "Lead the audience toward one expected meaning.",
        allowsMultiple: false,
      },
      {
        id: "reveal",
        label: "Twist Reveal",
        description: "Reveal the unexpected second meaning.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "premise-angle-actout-tags",
    name: "Premise → Angle → Act-Out → Tags",
    category: "core",
    example:
      "Group chats feel like meetings. Except nobody reads the agenda. (glancing at phone) 'Any updates?' … 'Yes—memes.' Minutes will be published as screenshots.",
    summary: "Full premise with fresh angle, acted moment, and quick tags.",
    parts: [
      {
        id: "premise",
        label: "Premise",
        description: "Topic + opinion or observation.",
        allowsMultiple: false,
      },
      {
        id: "angle",
        label: "Angle",
        description: "Fresh perspective or comparison.",
        allowsMultiple: false,
      },
      {
        id: "actout",
        label: "Act-Out",
        description: "Brief acted moment or character voice.",
        allowsMultiple: false,
      },
      {
        id: "tags",
        label: "Tags",
        description: "Quick extra punchlines; multiple allowed.",
        allowsMultiple: true,
      },
    ],
  },
  {
    id: "plant-and-payoff",
    name: "Plant & Payoff (Call-forward)",
    category: "core",
    example:
      "Mention your fear of geese early; 10 minutes later your 'heroic escape' is foiled… by a goose.",
    summary: "Plant a detail early; cash it in later with a twist.",
    parts: [
      {
        id: "plant",
        label: "Plant",
        description: "Establish a detail early that seems innocuous.",
        allowsMultiple: false,
      },
      {
        id: "bridge",
        label: "Bridge Content",
        description: "Middle material that doesn't reference the plant.",
        allowsMultiple: false,
      },
      {
        id: "payoff",
        label: "Payoff",
        description: "Call back to the plant with a twist for big laugh.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "callback",
    name: "Callback",
    category: "core",
    example: "At least it wasn't the goose again.",
    summary: "Refer back to an earlier joke; the memory itself becomes the punch.",
    parts: [
      {
        id: "original-reference",
        label: "Original Reference",
        description: "Reference to an earlier joke or bit in the set.",
        allowsMultiple: false,
      },
      {
        id: "callback-line",
        label: "Callback Line",
        description: "The line that triggers the memory and gets the laugh.",
        allowsMultiple: false,
      },
    ],
  },

  // WORDPLAY & LANGUAGE (4)
  {
    id: "pun-double-entendre",
    name: "Pun / Double Entendre",
    category: "wordplay",
    example: "I'd tell you a construction joke, but I'm still working on it.",
    summary: "One word, two meanings.",
    parts: [
      {
        id: "dual-meaning-line",
        label: "Dual Meaning Line",
        description: "The punchline where one word carries two meanings.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "ambiguity-resolve",
    name: "Ambiguity Resolve (Definition Flip)",
    category: "wordplay",
    example: "'Clean eating' means wiping crumbs off the pizza box first.",
    summary: "Redefine a common term unexpectedly.",
    parts: [
      {
        id: "common-term",
        label: "Common Term",
        description: "Introduce the term everyone knows.",
        allowsMultiple: false,
      },
      {
        id: "redefinition",
        label: "Redefinition",
        description: "Twist the meaning in an unexpected way.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "malapropism",
    name: "Malapropism / Misheard Word",
    category: "wordplay",
    example: "I have a 'gluten-free' relationship—no bread, just toast.",
    summary: "Use a near-sound-alike for a silly meaning.",
    parts: [
      {
        id: "expected-phrase",
        label: "Expected Phrase",
        description: "Set up the phrase the audience expects.",
        allowsMultiple: false,
      },
      {
        id: "sound-alike-twist",
        label: "Sound-Alike Twist",
        description: "Replace with a similar-sounding phrase for absurd effect.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "spoonerism",
    name: "Spoonerism / Word Swap",
    category: "wordplay",
    example: "Bunny rusiness is booming.",
    summary: "Swap initial sounds to create a comic error.",
    parts: [
      {
        id: "original-phrase",
        label: "Original Phrase",
        description: "The correct phrase.",
        allowsMultiple: false,
      },
      {
        id: "swapped-version",
        label: "Swapped Version",
        description: "The phrase with initial sounds swapped.",
        allowsMultiple: false,
      },
    ],
  },

  // COMPARISON ENGINES (3)
  {
    id: "analogy-metaphor",
    name: "Analogy / Extended Metaphor",
    category: "comparison",
    example: "Dating apps are slot machines that pay out… conversations.",
    summary: "Explain A by comparing it to B (absurdly accurate).",
    parts: [
      {
        id: "thing-a",
        label: "Thing A",
        description: "The actual subject you're describing.",
        allowsMultiple: false,
      },
      {
        id: "comparison-b",
        label: "Absurd Comparison to B",
        description: "The unexpected comparison that illuminates A.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "exaggeration-hyperbole",
    name: "Exaggeration (Hyperbole) / Understatement",
    category: "comparison",
    example:
      "I waited so long my phone aged out of updates. (hyperbole) OR The rent is… noticeable. (understatement)",
    summary: "Amplify or minimize for comic effect.",
    parts: [
      {
        id: "normal-situation",
        label: "Normal Situation",
        description: "The baseline reality.",
        allowsMultiple: false,
      },
      {
        id: "exaggerated-outcome",
        label: "Exaggerated/Understated Outcome",
        description: "The wildly amplified or minimized result.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "juxtaposition-contrast",
    name: "Juxtaposition / Contrast",
    category: "comparison",
    example:
      "My smartwatch congratulates me for standing. My landlord congratulates me for paying.",
    summary: "Place opposites together to reveal absurdity.",
    parts: [
      {
        id: "opposite-a",
        label: "Opposite A",
        description: "First contrasting element.",
        allowsMultiple: false,
      },
      {
        id: "opposite-b",
        label: "Opposite B",
        description: "Second contrasting element that highlights the absurdity.",
        allowsMultiple: false,
      },
    ],
  },

  // NARRATIVE & TIMING (5)
  {
    id: "story-with-button",
    name: "Story with Button",
    category: "narrative",
    example: "…and that's when I learned my 'smart' fridge is smarter than my therapist.",
    summary: "Tell a short story; the button is a crisp final punch.",
    parts: [
      {
        id: "story-setup",
        label: "Story Setup",
        description: "Establish the scene and characters.",
        allowsMultiple: false,
      },
      {
        id: "story-build",
        label: "Story Build",
        description: "Develop the narrative tension.",
        allowsMultiple: false,
      },
      {
        id: "button",
        label: "Button (Final Punch)",
        description: "Crisp one-line payoff that closes the story.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "list-escalation",
    name: "List Escalation",
    category: "narrative",
    example: "My morning routine: gratitude, green juice, and pretending my inbox is a rumor.",
    summary: "Rattle off items that heighten in silliness; final item is the biggest turn.",
    parts: [
      {
        id: "items-1-2",
        label: "Items 1-2",
        description: "First reasonable items that establish pattern.",
        allowsMultiple: false,
      },
      {
        id: "items-3-4",
        label: "Items 3-4 (Optional)",
        description: "Heighten the absurdity slightly.",
        allowsMultiple: false,
      },
      {
        id: "final-twist",
        label: "Final Twist Item",
        description: "The biggest, most absurd turn.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "shaggy-dog",
    name: "Shaggy Dog (Long Build, Anticlimax)",
    category: "narrative",
    example: "A five-minute epic that ends: 'So… free parking.'",
    summary: "Comically long setup, deliberately tiny or sideways payoff.",
    parts: [
      {
        id: "long-setup",
        label: "Long Setup",
        description: "Extended narrative with many details.",
        allowsMultiple: false,
      },
      {
        id: "more-setup",
        label: "More Setup",
        description: "Continue building anticipation.",
        allowsMultiple: false,
      },
      {
        id: "tiny-payoff",
        label: "Tiny Payoff",
        description: "Deliberately underwhelming or sideways conclusion.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "anti-joke-meta",
    name: "Anti-Joke / Meta",
    category: "narrative",
    example: "This is a joke about subverting expectations. (pause) That's it.",
    summary: "Avoid the expected punch; call out the structure itself.",
    parts: [
      {
        id: "expected-setup",
        label: "Expected Setup",
        description: "Begin like a traditional joke.",
        allowsMultiple: false,
      },
      {
        id: "subverted-punchline",
        label: "Subverted/Meta Punchline",
        description: "Avoid the punch or comment on the joke structure itself.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "one-liner",
    name: "One-Liner",
    category: "narrative",
    example: "I'm on a seafood diet—I see food, and it's eight dollars more than last week.",
    summary: "Premise and punch fused into a single tight sentence.",
    parts: [
      {
        id: "complete-joke",
        label: "Complete Joke",
        description: "The entire joke in one concise sentence: premise + punch.",
        allowsMultiple: false,
      },
    ],
  },

  // CALL-AND-RESPONSE (2)
  {
    id: "riddle-qa",
    name: "Riddle / Q&A",
    category: "call-response",
    example: "Why did the developer cross the road? To get to the other side effects.",
    summary: "Question tees up a hidden meaning.",
    parts: [
      {
        id: "question",
        label: "Question",
        description: "The setup question that primes the audience.",
        allowsMultiple: false,
      },
      {
        id: "answer-twist",
        label: "Answer with Twist",
        description: "The answer that reveals the hidden meaning or pun.",
        allowsMultiple: false,
      },
    ],
  },
  {
    id: "knock-knock",
    name: "Knock-Knock",
    category: "call-response",
    example: "Knock knock. Who's there? Interrupting cow. Interrupting cow w— MOOO!",
    summary:
      "Classic call-and-response pun vehicle. Works best for kids' humor or deliberate retro/meta bits.",
    parts: [
      {
        id: "knock-setup",
        label: "Knock Setup",
        description: "The 'Knock knock' and 'Who's there?' exchange.",
        allowsMultiple: false,
      },
      {
        id: "whos-there-exchange",
        label: "Who's There Exchange",
        description: "The name/phrase response.",
        allowsMultiple: false,
      },
      {
        id: "pun-punchline",
        label: "Pun Punchline",
        description: "The final '[Name] who?' response with the pun payoff.",
        allowsMultiple: false,
      },
    ],
  },

  // TOPPER (1)
  {
    id: "topper-tag-stacking",
    name: "Topper / Tag Stacking",
    category: "topper",
    example:
      "I meditate daily. It's like napping, but with branding. With candles. And an app subscription.",
    summary: "Punchline lands → add 1–3 shorter punches that escalate.",
    parts: [
      {
        id: "main-punchline",
        label: "Main Punchline",
        description: "The primary joke that gets the first laugh.",
        allowsMultiple: false,
      },
      {
        id: "tag-1-2",
        label: "Tags 1-2",
        description: "Quick follow-up punches that build on the main joke.",
        allowsMultiple: true,
      },
      {
        id: "tag-3-plus",
        label: "Tags 3+",
        description: "Additional escalating tags; multiple allowed.",
        allowsMultiple: true,
      },
    ],
  },
];

// Helper function to get structures by category
export function getStructuresByCategory(categoryId: string): JokeStructure[] {
  return JOKE_STRUCTURES.filter((structure) => structure.category === categoryId);
}

// Helper function to get a structure by ID
export function getStructureById(id: string): JokeStructure | undefined {
  return JOKE_STRUCTURES.find((structure) => structure.id === id);
}

// Helper function to get category info by ID
export function getCategoryById(id: string) {
  return STRUCTURE_CATEGORIES.find((category) => category.id === id);
}
