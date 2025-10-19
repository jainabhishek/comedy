"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useJokesQuery } from "@/hooks/useJokesQuery";
import { useAI } from "@/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AILoadingIndicator } from "@/components/ui/loading-spinner";
import { getStructureById, STRUCTURE_CATEGORIES, getStructuresByCategory } from "@/lib/structures";
import type { JokeStructure, JokeStructurePart, SelectedPartOption } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "premise" | "structure" | "part" | "review";

interface PartState {
  options: string[];
  selections: SelectedPartOption;
}

const ESTIMATED_TIME_RANGE = { min: 10, max: 600 };

export default function WorkshopPage() {
  const router = useRouter();
  const { createJoke } = useJokesQuery();
  const { generatePartOptions, loading, loadingPartId, suggestTags, error } = useAI();

  const [step, setStep] = useState<Step>("premise");
  const [premise, setPremise] = useState("");
  const [structureId, setStructureId] = useState<string | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [partsState, setPartsState] = useState<Record<string, PartState>>({});
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [estimatedTime, setEstimatedTime] = useState(90);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [notes, setNotes] = useState("");
  const [hasSuggestedTags, setHasSuggestedTags] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["core"]);
  const [selectedTechniques, setSelectedTechniques] = useState<("irony-sarcasm" | "character-voice" | "benign-violation")[]>([]);

  const currentStructure: JokeStructure | null = useMemo(() => {
    return structureId ? getStructureById(structureId) ?? null : null;
  }, [structureId]);

  const totalParts = currentStructure?.parts.length ?? 0;
  const currentPart: JokeStructurePart | null =
    step === "part" && currentStructure ? currentStructure.parts[currentPartIndex] ?? null : null;

  const orderedSelections = useMemo(() => {
    if (!currentStructure) return [];
    return currentStructure.parts.map((part) => partsState[part.id]?.selections ?? { partId: part.id, selected: [] });
  }, [currentStructure, partsState]);

  const previousSelections = useMemo(() => {
    if (!currentStructure || !currentPart) return [] as SelectedPartOption[];
    return currentStructure.parts
      .slice(0, currentPartIndex)
      .map((part) => partsState[part.id]?.selections)
      .filter((selection): selection is SelectedPartOption => Boolean(selection));
  }, [currentStructure, currentPart, currentPartIndex, partsState]);

  const resetStructureState = useCallback(() => {
    setPartsState({});
    setCustomInputs({});
    setCurrentPartIndex(0);
    setHasSuggestedTags(false);
  }, []);

  const ensurePartOptions = useCallback(async () => {
    if (!currentStructure || !currentPart || !premise) {
      return;
    }

    const existing = partsState[currentPart.id]?.options;
    if (existing && existing.length > 0) {
      return;
    }

    try {
      const { suggestions } = await generatePartOptions({
        structureId: currentStructure.id,
        partId: currentPart.id,
        premise,
        priorSelections: previousSelections,
      });

      setPartsState((prev) => ({
        ...prev,
        [currentPart.id]: {
          options: suggestions,
          selections:
            prev[currentPart.id]?.selections ?? {
              partId: currentPart.id,
              selected: [],
            },
        },
      }));
    } catch (err) {
      console.error("Error generating part options:", err);
    }
  }, [currentStructure, currentPart, generatePartOptions, partsState, premise, previousSelections]);

  useEffect(() => {
    if (step === "part") {
      void ensurePartOptions();
    }
  }, [ensurePartOptions, step]);

  const handleSelectStructure = (id: string) => {
    if (!premise.trim()) {
      return;
    }
    if (structureId !== id) {
      resetStructureState();
      setStructureId(id);
    }
    setStep("part");
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleTechnique = (technique: "irony-sarcasm" | "character-voice" | "benign-violation") => {
    setSelectedTechniques((prev) =>
      prev.includes(technique) ? prev.filter((t) => t !== technique) : [...prev, technique]
    );
  };

  const mergeOptions = (existing: string[] = [], incoming: string[] = []) => {
    const merged = new Set(existing.map((item) => item.trim()));
    incoming.forEach((item) => {
      const value = item.trim();
      if (value) {
        merged.add(value);
      }
    });
    return Array.from(merged);
  };

  const commitSelection = useCallback(
    (part: JokeStructurePart, updater: (current: SelectedPartOption) => SelectedPartOption) => {
      setPartsState((prev) => {
        const currentState = prev[part.id] ?? {
          options: [],
          selections: { partId: part.id, selected: [] },
        };

        const nextSelections = updater(currentState.selections);

        return {
          ...prev,
          [part.id]: {
            options: currentState.options,
            selections: {
              ...nextSelections,
              customInputs:
                nextSelections.customInputs && nextSelections.customInputs.length > 0
                  ? nextSelections.customInputs
                  : undefined,
            },
          },
        };
      });
    },
    []
  );

  const handleSelectOption = (part: JokeStructurePart, option: string, isCustom = false) => {
    if (!option.trim()) {
      return;
    }

    commitSelection(part, (current) => {
      const uniqueOption = option.trim();
      if (part.allowsMultiple) {
        const exists = current.selected.includes(uniqueOption);
        const nextSelected = exists
          ? current.selected.filter((item) => item !== uniqueOption)
          : [...current.selected, uniqueOption];
        const currentCustom = current.customInputs ?? [];
        const nextCustom = isCustom
          ? exists
            ? currentCustom.filter((item) => item !== uniqueOption)
            : [...new Set([...currentCustom, uniqueOption])]
          : currentCustom.filter((item) => item !== uniqueOption);
        return {
          partId: current.partId,
          selected: nextSelected,
          customInputs: nextCustom.length > 0 ? nextCustom : undefined,
        };
      }

      return {
        partId: current.partId,
        selected: [uniqueOption],
        customInputs: isCustom ? [uniqueOption] : undefined,
      };
    });

    if (isCustom) {
      setPartsState((prev) => {
        const state = prev[part.id] ?? {
          options: [],
          selections: { partId: part.id, selected: [] },
        };
        return {
          ...prev,
          [part.id]: {
            ...state,
            options: mergeOptions(state.options, [option]),
          },
        };
      });
    }
  };

  const handleAddCustomOption = (part: JokeStructurePart) => {
    const draft = customInputs[part.id]?.trim();
    if (!draft) {
      return;
    }
    handleSelectOption(part, draft, true);
    setCustomInputs((prev) => ({ ...prev, [part.id]: "" }));
  };

  const handleRegenerate = async () => {
    if (!currentStructure || !currentPart || !premise) {
      return;
    }

    try {
      const { suggestions } = await generatePartOptions({
        structureId: currentStructure.id,
        partId: currentPart.id,
        premise,
        priorSelections: previousSelections,
      });

      setPartsState((prev) => {
        const state = prev[currentPart.id] ?? {
          options: [],
          selections: { partId: currentPart.id, selected: [] },
        };
        return {
          ...prev,
          [currentPart.id]: {
            ...state,
            options: mergeOptions(state.options, suggestions),
          },
        };
      });
    } catch (err) {
      console.error("Error regenerating options:", err);
    }
  };

  const handleNextPart = () => {
    if (!currentStructure || !currentPart) {
      return;
    }
    const selection = partsState[currentPart.id]?.selections?.selected ?? [];
    if (selection.length === 0) {
      alert("Please choose at least one option before continuing.");
      return;
    }

    if (currentPartIndex + 1 < totalParts) {
      setCurrentPartIndex((index) => index + 1);
      setStep("part");
      return;
    }

    setStep("review");
  };

  const handlePreviousPart = () => {
    if (!currentStructure) {
      return;
    }
    if (currentPartIndex === 0) {
      setStep("structure");
      return;
    }
    setCurrentPartIndex((index) => Math.max(0, index - 1));
  };

  const handleEditPart = (index: number) => {
    if (!currentStructure) return;
    setCurrentPartIndex(index);
    setStep("part");
  };

  const handleSuggestTags = async () => {
    if (!currentStructure) return;

    const firstPart = currentStructure.parts[0];
    const lastPart = currentStructure.parts[currentStructure.parts.length - 1];
    const firstText = partsState[firstPart.id]?.selections.selected[0];
    const lastSelections = partsState[lastPart.id]?.selections.selected ?? [];
    const lastText = lastSelections[lastSelections.length - 1];

    if (!firstText || !lastText) {
      alert("Select at least one option for the first and last parts before requesting tags.");
      return;
    }

    try {
      const suggestions = await suggestTags(firstText, lastText);
      setTags(suggestions);
      setHasSuggestedTags(true);
    } catch (err) {
      console.error("Error suggesting tags:", err);
    }
  };

  const handleAddTag = () => {
    const value = newTag.trim();
    if (!value) return;
    setTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleSaveJoke = () => {
    if (!currentStructure) {
      alert("Select a structure before saving.");
      return;
    }

    const structuredParts = currentStructure.parts.map((part) => partsState[part.id]?.selections ?? {
      partId: part.id,
      selected: [],
    });

    const firstSelection = structuredParts[0]?.selected[0];
    const lastSelection = structuredParts[structuredParts.length - 1]?.selected.slice(-1)[0];

    if (!title.trim() || !firstSelection || !lastSelection) {
      alert("Please provide a title and make sure the first and last parts have selections.");
      return;
    }

    const finalNotes = notes.trim() || `Created from premise: ${premise}`;

    const structureMetadata = {
      structureId: currentStructure.id,
      structureName: currentStructure.name,
      parts: currentStructure.parts.map((part) => {
        const selection = partsState[part.id]?.selections;
        return {
          partId: part.id,
          label: part.label,
          selected: selection?.selected ?? [],
          customInputs: selection?.customInputs,
        };
      }),
    };

    const flattenedContent = structuredParts
      .flatMap((selection) => selection.selected)
      .filter(Boolean)
      .join("\n");

    const newJoke = createJoke({
      title: title.trim(),
      setup: firstSelection,
      punchline: lastSelection,
      tags,
      estimatedTime,
      energy: "medium",
      type: "observational",
      status: "draft",
      versions: [],
      performances: [],
      notes: `${finalNotes}\n\nStructure Parts:\n${flattenedContent}`.trim(),
      structure: structureMetadata,
      techniques: selectedTechniques.length > 0 ? selectedTechniques : undefined,
    });

    router.push(`/editor/${newJoke.id}`);
  };

  const stepIndicators = useMemo(() => {
    const labels = [
      { id: "premise", label: "Premise" },
      { id: "structure", label: "Structure" },
      {
        id: "part",
        label: currentStructure
          ? `Parts (${Math.min(currentPartIndex + 1, totalParts)}/${Math.max(totalParts, 1)})`
          : "Parts",
      },
      { id: "review", label: "Review" },
    ];

    const activeIndex = labels.findIndex((entry) => entry.id === step);

    return labels.map((entry, index) => ({
      ...entry,
      active: index === activeIndex,
      completed: index < activeIndex,
    }));
  }, [currentPartIndex, currentStructure, step, totalParts]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold">Joke Workshop ✨</h1>
        <p className="text-muted">Shape a premise into a structured joke with AI support.</p>
      </header>

      <section className="flex flex-wrap gap-2">
        {stepIndicators.map((indicator, index) => (
          <Badge
            key={indicator.id}
            variant={indicator.active ? "default" : indicator.completed ? "success" : "outline"}
            className="uppercase tracking-[0.25em]"
          >
            Step {index + 1}: {indicator.label}
          </Badge>
        ))}
      </section>

      {step === "premise" && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step 1: Capture Your Premise</CardTitle>
            <CardDescription>Describe the seed of the bit so the AI understands the context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What are you noticing? Where's the tension?"
              value={premise}
              onChange={(event) => setPremise(event.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button onClick={() => setStep("structure")} disabled={!premise.trim()}>
                Next: Choose Structure
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "structure" && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step 2: Pick a Structure</CardTitle>
            <CardDescription>Select the blueprint that best fits your premise. Structures are organized by category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {STRUCTURE_CATEGORIES.map((category) => {
              const categoryStructures = getStructuresByCategory(category.id);
              const isExpanded = expandedCategories.includes(category.id);
              
              return (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-left">
                      <h3 className="font-semibold text-base">{category.name}</h3>
                      <p className="text-sm text-muted">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {categoryStructures.length}
                      </Badge>
                      <svg
                        className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 pt-0 grid gap-4 md:grid-cols-2">
                      {categoryStructures.map((structure) => (
                        <Card
                          key={structure.id}
                          className={cn(
                            "cursor-pointer border border-dashed transition-all hover:shadow-md",
                            structureId === structure.id && "border-primary bg-primary/5"
                          )}
                          onClick={() => handleSelectStructure(structure.id)}
                        >
                          <CardHeader>
                            <CardTitle className="text-lg">{structure.name}</CardTitle>
                            <CardDescription className="space-y-1">
                              <p>{structure.summary}</p>
                              <p className="text-xs italic text-muted/80 pt-1">
                                Example: &ldquo;{structure.example}&rdquo;
                              </p>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {structure.parts.map((part, index) => (
                              <div key={part.id} className="flex items-start gap-2 text-sm text-muted">
                                <span className="font-semibold text-foreground">{index + 1}.</span>
                                <div>
                                  <p className="font-medium text-foreground">{part.label}</p>
                                  <p className="text-xs">{part.description}</p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {step === "part" && currentStructure && currentPart && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>
              Step 3: Craft {currentPart.label}
              <span className="ml-2 text-sm text-muted">({currentPartIndex + 1} of {totalParts})</span>
            </CardTitle>
            <CardDescription>{currentPart.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {orderedSelections.map((selection, index) => {
                const part = currentStructure.parts[index];
                const hasPick = selection.selected.length > 0;
                return (
                  <Badge key={part.id} variant={hasPick ? "success" : "outline"}>
                    {part.label}: {hasPick ? selection.selected.join(" | ") : "Pending"}
                  </Badge>
                );
              })}
            </div>

            <div className="grid gap-3">
              {(partsState[currentPart.id]?.options ?? []).map((option) => {
                const isSelected = partsState[currentPart.id]?.selections.selected.includes(option) ?? false;
                return (
                  <Card
                    key={`${currentPart.id}-${option}`}
                    className={cn(
                      "cursor-pointer border transition-all",
                      isSelected ? "border-primary bg-primary/10" : "hover:border-primary/60"
                    )}
                    onClick={() => handleSelectOption(currentPart, option)}
                  >
                    <CardContent className="p-4">
                      <p>{option}</p>
                    </CardContent>
                  </Card>
                );
              })}

              {loadingPartId === currentPart.id && (
                <div className="flex justify-center py-4">
                  <AILoadingIndicator />
                </div>
              )}

              <div className="glass rounded-xl p-4 space-y-3">
                <p className="text-sm text-muted">Want something different? Add your own take.</p>
                <Textarea
                  placeholder={`Write a custom ${currentPart.label.toLowerCase()}...`}
                  value={customInputs[currentPart.id] ?? ""}
                  onChange={(event) =>
                    setCustomInputs((prev) => ({ ...prev, [currentPart.id]: event.target.value }))
                  }
                  rows={3}
                />
                <Button
                  size="sm"
                  onClick={() => handleAddCustomOption(currentPart)}
                  disabled={!(customInputs[currentPart.id]?.trim())}
                >
                  Add Custom Option
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(partsState[currentPart.id]?.selections.selected ?? []).map((selection) => (
                <Badge key={selection} variant="glass" className="gap-2">
                  {selection}
                  <button
                    type="button"
                    className="text-xs uppercase text-muted hover:text-foreground"
                    onClick={() => handleSelectOption(currentPart, selection, partsState[currentPart.id]?.selections.customInputs?.includes(selection) ?? false)}
                  >
                    remove
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handlePreviousPart}>
                Back
              </Button>
              <Button variant="secondary" onClick={handleRegenerate}>
                Regenerate Ideas
              </Button>
              <Button onClick={handleNextPart}>Next</Button>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}
          </CardContent>
        </Card>
      )}

      {step === "review" && currentStructure && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step 4: Review & Save</CardTitle>
            <CardDescription>Finalize details and send the joke to your library.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="glass rounded-xl p-4 space-y-4">
              <h3 className="text-lg font-semibold">Structure Summary</h3>
              {currentStructure.parts.map((part, index) => {
                const selection = partsState[part.id]?.selections.selected ?? [];
                return (
                  <div key={part.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {index + 1}. {part.label}
                      </p>
                      <p className="text-sm text-muted">{selection.length > 0 ? selection.join(" | ") : "No selection"}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEditPart(index)}>
                      Edit
                    </Button>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Joke Title</label>
                <Input
                  placeholder="Give your joke a hook..."
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Time (seconds)</label>
                <Input
                  type="number"
                  min={ESTIMATED_TIME_RANGE.min}
                  max={ESTIMATED_TIME_RANGE.max}
                  value={estimatedTime}
                  onChange={(event) => setEstimatedTime(Number(event.target.value) || ESTIMATED_TIME_RANGE.min)}
                />
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium uppercase tracking-[0.2em]">Tags</h3>
                <Button variant="outline" size="sm" onClick={handleSuggestTags} disabled={hasSuggestedTags && tags.length > 0}>
                  {hasSuggestedTags ? "Tags Added" : "Suggest Tags"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="glass" className="gap-2">
                    {tag}
                    <button type="button" className="text-xs uppercase text-muted" onClick={() => handleRemoveTag(tag)}>
                      remove
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag manually"
                  value={newTag}
                  onChange={(event) => setNewTag(event.target.value)}
                />
                <Button variant="secondary" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </section>

            <section className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add reminders about delivery, act-outs, or callbacks."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
              />
            </section>

            <section className="space-y-3">
              <div>
                <label className="text-sm font-medium">Optional Techniques (Attitude/POV)</label>
                <p className="text-xs text-muted mt-1">Add optional layers to enhance your joke&apos;s delivery and impact.</p>
              </div>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedTechniques.includes("irony-sarcasm")}
                    onChange={() => toggleTechnique("irony-sarcasm")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">Irony / Sarcasm</p>
                    <p className="text-xs text-muted">Add bite by saying the opposite of what you mean</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedTechniques.includes("character-voice")}
                    onChange={() => toggleTechnique("character-voice")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">Character / Voice Switch</p>
                    <p className="text-xs text-muted">Adopt different personas for contrast</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedTechniques.includes("benign-violation")}
                    onChange={() => toggleTechnique("benign-violation")}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-sm">Benign Violation ⚠️</p>
                    <p className="text-xs text-muted">Tease boundaries mindfully (context-sensitive)</p>
                  </div>
                </label>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSaveJoke} disabled={loading}>
                {loading ? <AILoadingIndicator /> : "Save Joke"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Cancel</Button>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
