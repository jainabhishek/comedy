"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useJokesQuery } from "@/hooks/useJokesQuery";
import { useRoutinesQuery } from "@/hooks/useRoutinesQuery";
import { useAI } from "@/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatTime } from "@/lib/utils";
import type { Routine, Joke, FlowAnalysis, RoutineJokeSummary } from "@/lib/types";

export default function RoutineBuilder({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { jokes, loading: jokesLoading } = useJokesQuery();
  const { routines, updateRoutine, deleteRoutine, loading: routinesLoading } = useRoutinesQuery();
  const { optimizeRoutine, analyzeRoutine, loading: aiLoading } = useAI();

  const [routineId, setRoutineId] = useState<string | null>(null);
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [routineJokes, setRoutineJokes] = useState<Joke[]>([]);
  const [availableJokes, setAvailableJokes] = useState<Joke[]>([]);
  const [editedName, setEditedName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [flowAnalysis, setFlowAnalysis] = useState<FlowAnalysis | null>(null);

  useEffect(() => {
    params.then((p) => setRoutineId(p.id));
  }, [params]);

  useEffect(() => {
    if (!routineId) return;
    const foundRoutine = routines.find((r) => r.id === routineId);
    if (foundRoutine) {
      setRoutine(foundRoutine);
      setEditedName(foundRoutine.name);
      
      // Load jokes in routine
      const jokesInRoutine = foundRoutine.jokeIds
        .map((id) => jokes.find((j) => j.id === id))
        .filter((j): j is Joke => j !== undefined);
      setRoutineJokes(jokesInRoutine);
      
      // Load available jokes (not in routine)
      const available = jokes.filter((j) => !foundRoutine.jokeIds.includes(j.id));
      setAvailableJokes(available);
    }
  }, [routines, jokes, routineId]);

  useEffect(() => {
    if (routine) {
      const hasChanges =
        editedName !== routine.name ||
        JSON.stringify(routineJokes.map((j) => j.id)) !== JSON.stringify(routine.jokeIds);
      setHasUnsavedChanges(hasChanges);
    }
  }, [routine, editedName, routineJokes]);

  if (jokesLoading || routinesLoading || !routineId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading routine...</p>
        </div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">Routine Not Found</h2>
          <p className="text-muted mb-6">This routine doesn&apos;t exist or has been deleted.</p>
          <Button onClick={() => router.push("/routines")}>Back to Routines</Button>
        </div>
      </div>
    );
  }

  const totalTime = routineJokes.reduce((sum, joke) => sum + joke.estimatedTime, 0);
  const targetTime = routine.targetTime || 300;
  const timePercent = (totalTime / targetTime) * 100;

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    // Dragging within routine
    if (source.droppableId === "routine" && destination.droppableId === "routine") {
      const newJokes = Array.from(routineJokes);
      const [removed] = newJokes.splice(source.index, 1);
      newJokes.splice(destination.index, 0, removed);
      setRoutineJokes(newJokes);
    }

    // Dragging from available to routine
    if (source.droppableId === "available" && destination.droppableId === "routine") {
      const joke = availableJokes[source.index];
      const newRoutineJokes = Array.from(routineJokes);
      newRoutineJokes.splice(destination.index, 0, joke);
      setRoutineJokes(newRoutineJokes);
      setAvailableJokes(availableJokes.filter((j) => j.id !== joke.id));
    }

    // Dragging from routine to available
    if (source.droppableId === "routine" && destination.droppableId === "available") {
      const joke = routineJokes[source.index];
      const newRoutineJokes = routineJokes.filter((j) => j.id !== joke.id);
      setRoutineJokes(newRoutineJokes);
      setAvailableJokes([...availableJokes, joke]);
    }
  };

  const handleSave = () => {
    updateRoutine(routine.id, {
      name: editedName,
      jokeIds: routineJokes.map((j) => j.id),
      currentTime: totalTime,
    });
    setHasUnsavedChanges(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this routine? This cannot be undone.")) {
      deleteRoutine(routine.id);
      router.push("/routines");
    }
  };

  const handleOptimize = async () => {
    const jokesData: RoutineJokeSummary[] = routineJokes.map((j): RoutineJokeSummary => ({
      id: j.id,
      title: j.title,
      energy: j.energy,
      type: j.type,
      estimatedTime: j.estimatedTime,
    }));

    const result = await optimizeRoutine(jokesData);
    
    if (result && result.optimizedOrder) {
      const optimized = result.optimizedOrder
        .map((id) => routineJokes.find((j) => j.id === id))
        .filter((j): j is Joke => j !== undefined);
      
      if (confirm(`AI suggests reordering for better flow. Apply changes?\n\nReason: ${result.reasoning}`)) {
        setRoutineJokes(optimized);
      }
    }
  };

  const handleAnalyze = async () => {
    const jokesData: RoutineJokeSummary[] = routineJokes.map((j): RoutineJokeSummary => ({
      id: j.id,
      title: j.title,
      energy: j.energy,
      type: j.type,
      estimatedTime: j.estimatedTime,
    }));

    const result = await analyzeRoutine(jokesData);
    if (result) {
      setFlowAnalysis(result);
    }
  };

  const removeFromRoutine = (jokeId: string) => {
    const joke = routineJokes.find((j) => j.id === jokeId);
    if (joke) {
      setRoutineJokes(routineJokes.filter((j) => j.id !== jokeId));
      setAvailableJokes([...availableJokes, joke]);
    }
  };

  const filteredAvailable = availableJokes.filter((joke) =>
    joke.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    joke.setup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="secondary" onClick={() => router.push("/routines")}>
            ← Back to Routines
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="warning" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
            💾 Save
          </Button>
          <Button variant="secondary" onClick={handleDelete}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Routine Header */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Routine name..."
              className="text-2xl font-bold"
            />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Time: {formatTime(totalTime)} / {formatTime(targetTime)}
                  </span>
                  <span className="text-sm text-muted">
                    {routineJokes.length} jokes
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      timePercent > 100
                        ? "bg-red-500"
                        : timePercent > 90
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(timePercent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAnalyze} disabled={aiLoading || routineJokes.length === 0}>
                  🔍 Analyze Flow
                </Button>
                <Button onClick={handleOptimize} disabled={aiLoading || routineJokes.length < 2}>
                  ✨ Optimize Order
                </Button>
              </div>
            </div>

            {aiLoading && (
              <div className="flex items-center gap-2 text-muted">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                <span>AI is analyzing your routine...</span>
              </div>
            )}

            {flowAnalysis && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-primary">Flow Analysis</p>
                  <Badge variant="success">Score: {flowAnalysis.flowScore}/100</Badge>
                </div>
                {flowAnalysis.suggestions?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Suggestions:</p>
                    {flowAnalysis.suggestions.slice(0, 3).map((suggestion, index) => (
                      <div key={`${suggestion.type}-${index}`} className="text-sm p-2 bg-white rounded border">
                        <p className="font-medium">{suggestion.type}</p>
                        <p className="text-muted">{suggestion.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
                {flowAnalysis.callbacks?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Callback Opportunities: {flowAnalysis.callbacks.length}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Jokes */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Available Jokes ({filteredAvailable.length})</CardTitle>
                <Input
                  placeholder="Search jokes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </CardHeader>
              <CardContent>
                <Droppable droppableId="available">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-2 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-primary/5 border-2 border-primary border-dashed" : ""
                      }`}
                    >
                      {filteredAvailable.length === 0 ? (
                        <p className="text-center text-muted py-8">
                          {searchQuery ? "No jokes found" : "All jokes are in the routine!"}
                        </p>
                      ) : (
                        filteredAvailable.map((joke, index) => (
                          <Draggable key={joke.id} draggableId={joke.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-primary" : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm mb-1">{joke.title}</p>
                                    <p className="text-xs text-muted line-clamp-2">{joke.setup}</p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline" className="text-xs mb-1">
                                      {formatTime(joke.estimatedTime)}
                                    </Badge>
                                    <p className="text-xs text-muted">{joke.energy}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* Routine */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Routine ({routineJokes.length} jokes)</CardTitle>
                <p className="text-sm text-muted">Drag jokes here to build your routine</p>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="routine">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-2 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? "bg-secondary/5 border-2 border-secondary border-dashed" : ""
                      }`}
                    >
                      {routineJokes.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                          <p className="text-2xl mb-2">👈</p>
                          <p className="text-muted">Drag jokes from the left to build your routine</p>
                        </div>
                      ) : (
                        routineJokes.map((joke, index) => (
                          <Draggable key={joke.id} draggableId={joke.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 bg-white border rounded-lg cursor-move hover:shadow-md transition-shadow ${
                                  snapshot.isDragging ? "shadow-lg ring-2 ring-secondary" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <p className="font-medium text-sm">{joke.title}</p>
                                      <button
                                        onClick={() => removeFromRoutine(joke.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                    <p className="text-xs text-muted line-clamp-2 mb-2">{joke.setup}</p>
                                    <div className="flex gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {formatTime(joke.estimatedTime)}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {joke.energy} energy
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        {joke.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>
        </div>
      </DragDropContext>

      {/* Timeline Visualization */}
      {routineJokes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center h-12 gap-1">
                {routineJokes.map((joke, index) => {
                  const widthPercent = (joke.estimatedTime / totalTime) * 100;
                  const energyColor =
                    joke.energy === "high"
                      ? "bg-red-500"
                      : joke.energy === "medium"
                      ? "bg-yellow-500"
                      : "bg-blue-500";
                  
                  return (
                    <div
                      key={joke.id}
                      className={`h-full ${energyColor} rounded flex items-center justify-center text-white text-xs font-bold hover:opacity-80 cursor-pointer transition-opacity`}
                      style={{ width: `${widthPercent}%` }}
                      title={`${index + 1}. ${joke.title} (${formatTime(joke.estimatedTime)})`}
                    >
                      {widthPercent > 8 && index + 1}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Start</span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded" /> Low
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded" /> Medium
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded" /> High
                  </span>
                </div>
                <span>{formatTime(totalTime)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
