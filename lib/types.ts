// Core Type Definitions for Tight 5 Comedy App

// Premise - Initial joke idea
export interface Premise {
  id: string;
  content: string;
  createdAt: number;
  tags: string[];
}

// Joke Version - Historical versions of jokes
export interface JokeVersion {
  id: string;
  setup: string;
  punchline: string;
  tags: string[];
  createdAt: number;
  notes: string;
}

// Joke Structure Metadata
export interface JokeStructurePart {
  id: string;
  label: string;
  description: string;
  allowsMultiple: boolean;
}

export interface JokeStructure {
  id: string;
  name: string;
  summary: string;
  example: string;
  category: string;
  parts: JokeStructurePart[];
}

export interface SelectedPartOption {
  partId: string;
  selected: string[];
  customInputs?: string[];
}

export interface JokeStructureSelection {
  structureId: string;
  structureName: string;
  parts: Array<{
    partId: string;
    label: string;
    selected: string[];
    customInputs?: string[];
  }>;
}

// Performance - Practice/live performance data
export interface Performance {
  id: string;
  jokeId: string;
  routineId?: string;
  date: number;
  actualTime: number; // Seconds
  outcome: "killed" | "worked" | "bombed" | "neutral";
  notes: string;
  venue?: string;
}

// Joke - Complete joke with all variations
export interface Joke {
  id: string;
  premiseId?: string; // Link to original premise
  title: string; // Short description
  setup: string; // Joke setup
  punchline: string; // Main punchline
  tags: string[]; // Callbacks, toppers, act-outs
  estimatedTime: number; // Seconds
  energy: "low" | "medium" | "high";
  type: "observational" | "one-liner" | "story" | "callback" | "crowd-work";
  status: "draft" | "working" | "polished" | "retired";
  versions: JokeVersion[]; // Version history
  performances: Performance[]; // Performance data
  notes: string;
  structure?: JokeStructureSelection;
  techniques?: ("irony-sarcasm" | "character-voice" | "benign-violation")[];
  createdAt: number;
  updatedAt: number;
}

// Routine Suggestion - AI placement suggestions
export interface RoutineSuggestion {
  type: "placement" | "callback" | "reorder" | "remove";
  jokeId: string;
  position?: number;
  reason: string;
  confidence: number; // 0-100
}

// Routine - Collection of jokes in order
export interface Routine {
  id: string;
  name: string;
  jokeIds: string[]; // Ordered list
  targetTime: number; // Default: 300 seconds (5 min)
  currentTime: number; // Calculated from jokes
  flowScore?: number; // AI-calculated 0-100
  aiSuggestions?: RoutineSuggestion[];
  createdAt: number;
  updatedAt: number;
}

// Chat Message for AI interactions
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Chat History - AI conversation per joke/routine
export interface ChatHistory {
  id: string;
  entityId: string; // jokeId or routineId
  entityType: "joke" | "routine";
  messages: ChatMessage[];
  createdAt: number;
}

// AI Response Types

export interface WeaknessReport {
  weaknesses: Weakness[];
  suggestions: string[];
  overallScore: number; // 0-100
}

export interface JokeImprovement {
  setup: string;
  punchline: string;
  explanation: string;
}

export interface Weakness {
  type: "setup-too-long" | "unclear-punchline" | "weak-tag" | "timing" | "structure";
  description: string;
  location: "setup" | "punchline" | "tags";
  severity: "low" | "medium" | "high";
}

export interface CallbackOpportunity {
  jokeId1: string;
  jokeId2: string;
  reason: string;
  confidence: number; // 0-100
  suggestedCallback?: string;
}

export interface FlowAnalysis {
  flowScore: number; // 0-100
  energyProgression: number[]; // Energy levels for each joke
  topicDiversity: number; // 0-100
  callbacks: CallbackOpportunity[];
  suggestions: RoutineSuggestion[];
  issues: FlowIssue[];
}

export interface RoutineJokeSummary {
  id: string;
  title: string;
  energy: Joke["energy"];
  type: Joke["type"];
  estimatedTime: number;
}

export interface FlowIssue {
  type: "repetitive-topic" | "energy-drop" | "timing-issue" | "weak-opening" | "weak-closing";
  description: string;
  affectedJokeIds: string[];
  severity: "low" | "medium" | "high";
}

export interface PlacementSuggestion {
  position: number; // 0-indexed position in routine
  score: number; // 0-100
  reasoning: string;
  pros: string[];
  cons: string[];
}

export interface PerformanceInsights {
  overallRating: number; // 0-100
  strengths: string[];
  weaknesses: string[];
  patterns: PerformancePattern[];
  recommendations: string[];
  bestJokes: string[]; // jokeIds
  worstJokes: string[]; // jokeIds
}

export interface PerformancePattern {
  pattern: string;
  description: string;
  frequency: number;
  impact: "positive" | "negative" | "neutral";
}

// AI Context for guardrails
export type AIContext =
  | "joke-generation"
  | "joke-improvement"
  | "joke-analysis"
  | "routine-analysis"
  | "routine-optimization"
  | "performance-analysis";

// Storage Data Structure
export interface StorageData {
  jokes: Joke[];
  routines: Routine[];
  premises: Premise[];
  performances: Performance[];
  version: string;
  lastUpdated: number;
}

// Filter and Sort Options
export interface JokeFilters {
  status?: Joke["status"][];
  energy?: Joke["energy"][];
  type?: Joke["type"][];
  tags?: string[];
  search?: string;
}

export interface JokeSortOption {
  field: "createdAt" | "updatedAt" | "title" | "estimatedTime" | "performanceRating";
  direction: "asc" | "desc";
}

// UI State Types
export interface DragItem {
  id: string;
  type: "joke";
  joke: Joke;
}

export interface DropResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}
