"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useJokesQuery } from "@/hooks/useJokesQuery";
import { useAI } from "@/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { getStructureById, getCategoryById } from "@/lib/structures";
import type { Joke, JokeVersion, JokeImprovement, WeaknessReport, Weakness } from "@/lib/types";
import { nanoid } from "nanoid";

export default function JokeEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { jokes, updateJoke, deleteJoke, loading: jokesLoading } = useJokesQuery();
  const { improveJoke, analyzeJoke, loading: aiLoading } = useAI();

  const [jokeId, setJokeId] = useState<string | null>(null);
  const [joke, setJoke] = useState<Joke | null>(null);
  const [editedSetup, setEditedSetup] = useState("");
  const [editedPunchline, setEditedPunchline] = useState("");
  const [editedTitle, setEditedTitle] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedTime, setEditedTime] = useState(30);
  const [editedEnergy, setEditedEnergy] = useState<"low" | "medium" | "high">("medium");
  const [editedType, setEditedType] = useState<
    "observational" | "one-liner" | "story" | "callback" | "crowd-work"
  >("observational");
  const [editedStatus, setEditedStatus] = useState<"draft" | "working" | "polished" | "retired">(
    "draft"
  );

  const [showVersions, setShowVersions] = useState(false);
  const [showPerformances, setShowPerformances] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<JokeImprovement | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<WeaknessReport | null>(null);

  const [newTag, setNewTag] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    params.then((p) => setJokeId(p.id));
  }, [params]);

  useEffect(() => {
    if (!jokeId) return;
    const foundJoke = jokes.find((j) => j.id === jokeId);
    if (foundJoke) {
      setJoke(foundJoke);
      setEditedSetup(foundJoke.setup);
      setEditedPunchline(foundJoke.punchline);
      setEditedTitle(foundJoke.title);
      setEditedNotes(foundJoke.notes);
      setEditedTags(foundJoke.tags);
      setEditedTime(foundJoke.estimatedTime);
      setEditedEnergy(foundJoke.energy);
      setEditedType(foundJoke.type);
      setEditedStatus(foundJoke.status);
    }
  }, [jokes, jokeId]);

  useEffect(() => {
    if (joke) {
      const hasChanges =
        editedSetup !== joke.setup ||
        editedPunchline !== joke.punchline ||
        editedTitle !== joke.title ||
        editedNotes !== joke.notes ||
        JSON.stringify(editedTags) !== JSON.stringify(joke.tags) ||
        editedTime !== joke.estimatedTime ||
        editedEnergy !== joke.energy ||
        editedType !== joke.type ||
        editedStatus !== joke.status;

      setHasUnsavedChanges(hasChanges);
    }
  }, [
    joke,
    editedSetup,
    editedPunchline,
    editedTitle,
    editedNotes,
    editedTags,
    editedTime,
    editedEnergy,
    editedType,
    editedStatus,
  ]);

  if (jokesLoading || !jokeId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading joke...</p>
        </div>
      </div>
    );
  }

  if (!joke) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">Joke Not Found</h2>
          <p className="text-muted mb-6">This joke doesn&apos;t exist or has been deleted.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    // Create new version if setup or punchline changed
    const needsVersion = editedSetup !== joke.setup || editedPunchline !== joke.punchline;
    const newVersion: JokeVersion | null = needsVersion
      ? {
          id: nanoid(),
          setup: joke.setup,
          punchline: joke.punchline,
          tags: joke.tags,
          notes: joke.notes,
          createdAt: Date.now(),
        }
      : null;

    updateJoke(joke.id, {
      setup: editedSetup,
      punchline: editedPunchline,
      title: editedTitle,
      notes: editedNotes,
      tags: editedTags,
      estimatedTime: editedTime,
      energy: editedEnergy,
      type: editedType,
      status: editedStatus,
      versions: newVersion ? [newVersion, ...joke.versions] : joke.versions,
    });

    setHasUnsavedChanges(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this joke? This cannot be undone.")) {
      deleteJoke(joke.id);
      router.push("/dashboard");
    }
  };

  const handlePunchUp = async () => {
    const result = await improveJoke(
      editedSetup,
      editedPunchline,
      "Make this joke funnier and punchier"
    );

    if (result) {
      setAiSuggestion(result);
    }
  };

  const handleAnalyze = async () => {
    const result = await analyzeJoke(editedSetup, editedPunchline, editedTags);
    if (result) {
      setAiAnalysis(result);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setEditedSetup(aiSuggestion.setup);
      setEditedPunchline(aiSuggestion.punchline);
      setAiSuggestion(null);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setEditedTags(editedTags.filter((t) => t !== tag));
  };

  const restoreVersion = (version: JokeVersion) => {
    if (confirm("Restore this version? Your current changes will be saved as a new version.")) {
      setEditedSetup(version.setup);
      setEditedPunchline(version.punchline);
      setEditedTags(version.tags);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="warning" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            💾 Save Changes
          </Button>
          <Button variant="secondary" onClick={handleDelete}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>Joke Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Give your joke a memorable title..."
                className="text-lg font-medium"
              />
            </CardContent>
          </Card>

          {/* Setup Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Setup</CardTitle>
                <Badge>{editedSetup.length} characters</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedSetup}
                onChange={(e) => setEditedSetup(e.target.value)}
                placeholder="Enter your joke setup..."
                className="min-h-[120px] text-base"
              />
            </CardContent>
          </Card>

          {/* Punchline Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Punchline</CardTitle>
                <Badge>{editedPunchline.length} characters</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedPunchline}
                onChange={(e) => setEditedPunchline(e.target.value)}
                placeholder="Enter your punchline..."
                className="min-h-[100px] text-base"
              />
            </CardContent>
          </Card>

          {/* AI Actions */}
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={handlePunchUp}
                  disabled={aiLoading || !editedSetup || !editedPunchline}
                >
                  ✨ Punch Up Joke
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleAnalyze}
                  disabled={aiLoading || !editedSetup || !editedPunchline}
                >
                  🔍 Analyze Weaknesses
                </Button>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-2 text-muted">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  <span>AI is thinking...</span>
                </div>
              )}

              {aiSuggestion && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-primary">AI Suggestion:</p>
                    <Button size="sm" onClick={applyAiSuggestion}>
                      Apply Suggestion
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">Setup:</p>
                      <p className="text-muted">{aiSuggestion.setup}</p>
                    </div>
                    <div>
                      <p className="font-medium">Punchline:</p>
                      <p className="text-muted">{aiSuggestion.punchline}</p>
                    </div>
                    {aiSuggestion.explanation && (
                      <div>
                        <p className="font-medium">Why:</p>
                        <p className="text-muted italic">{aiSuggestion.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {aiAnalysis && (
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20 space-y-3">
                  <p className="font-medium text-secondary">Analysis Results:</p>
                  {aiAnalysis.weaknesses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Weaknesses:</p>
                      {aiAnalysis.weaknesses.map((weakness: Weakness, index) => (
                        <div
                          key={`${weakness.type}-${index}`}
                          className="text-sm p-2 bg-white rounded border"
                        >
                          <Badge
                            variant={weakness.severity === "high" ? "warning" : "outline"}
                            className="mb-1"
                          >
                            {weakness.type}
                          </Badge>
                          <p className="text-muted">{weakness.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {aiAnalysis.suggestions.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Suggestions:</p>
                      <ul className="list-disc list-inside text-sm text-muted">
                        {aiAnalysis.suggestions.map((suggestion, index) => (
                          <li key={`${suggestion}-${index}`}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add any notes about this joke..."
                className="min-h-[80px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Structure Info */}
          {joke?.structure && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">{joke.structure.structureName}</p>
                  {joke.structure.structureId && getStructureById(joke.structure.structureId) && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {getCategoryById(getStructureById(joke.structure.structureId)!.category)
                        ?.name || "Unknown Category"}
                    </Badge>
                  )}
                </div>
                {joke.techniques && joke.techniques.length > 0 && (
                  <div>
                    <p className="text-xs text-muted mb-2">Techniques:</p>
                    <div className="flex flex-wrap gap-1">
                      {joke.techniques.map((technique) => (
                        <Badge key={technique} variant="outline" className="text-xs">
                          {technique === "irony-sarcasm"
                            ? "Irony/Sarcasm"
                            : technique === "character-voice"
                              ? "Character Voice"
                              : "Benign Violation"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value as Joke["status"])}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="draft">Draft</option>
                  <option value="working">Working</option>
                  <option value="polished">Polished</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={editedType}
                  onChange={(e) => setEditedType(e.target.value as Joke["type"])}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="observational">Observational</option>
                  <option value="one-liner">One-liner</option>
                  <option value="story">Story</option>
                  <option value="callback">Callback</option>
                  <option value="crowd-work">Crowd Work</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Energy</label>
                <select
                  value={editedEnergy}
                  onChange={(e) => setEditedEnergy(e.target.value as Joke["energy"])}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time (seconds)</label>
                <Input
                  type="number"
                  value={editedTime}
                  onChange={(e) => setEditedTime(Number(e.target.value))}
                  min={10}
                  max={300}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add tag..."
                />
                <Button onClick={addTag}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Version History</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowVersions(!showVersions)}
                >
                  {showVersions ? "Hide" : "Show"} ({joke.versions.length})
                </Button>
              </div>
            </CardHeader>
            {showVersions && (
              <CardContent className="space-y-2">
                {joke.versions.length === 0 ? (
                  <p className="text-sm text-muted">No previous versions</p>
                ) : (
                  joke.versions.map((version) => (
                    <div
                      key={version.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => restoreVersion(version)}
                    >
                      <p className="text-xs text-muted mb-1">{formatDate(version.createdAt)}</p>
                      <p className="text-sm line-clamp-2">{version.setup}</p>
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>

          {/* Performance History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Performances</CardTitle>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPerformances(!showPerformances)}
                >
                  {showPerformances ? "Hide" : "Show"} ({joke.performances.length})
                </Button>
              </div>
            </CardHeader>
            {showPerformances && (
              <CardContent className="space-y-2">
                {joke.performances.length === 0 ? (
                  <p className="text-sm text-muted">No performances yet</p>
                ) : (
                  joke.performances.map((perf) => (
                    <div key={perf.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant={
                            perf.outcome === "killed"
                              ? "success"
                              : perf.outcome === "worked"
                                ? "default"
                                : perf.outcome === "bombed"
                                  ? "warning"
                                  : "outline"
                          }
                        >
                          {perf.outcome}
                        </Badge>
                        <span className="text-xs text-muted">{formatTime(perf.actualTime)}</span>
                      </div>
                      <p className="text-xs text-muted">{formatDate(perf.date)}</p>
                      {perf.venue && <p className="text-xs">{perf.venue}</p>}
                      {perf.notes && <p className="text-xs text-muted mt-1">{perf.notes}</p>}
                    </div>
                  ))
                )}
              </CardContent>
            )}
          </Card>

          {/* Info */}
          <Card>
            <CardContent className="text-xs text-muted space-y-1 pt-6">
              <p>Created: {formatDate(joke.createdAt)}</p>
              <p>Modified: {formatDate(joke.updatedAt)}</p>
              <p>Joke ID: {joke.id}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
