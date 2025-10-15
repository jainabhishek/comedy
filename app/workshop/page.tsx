"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJokes } from "@/hooks/useJokes";
import { useAI } from "@/hooks/useAI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AILoadingIndicator } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";

export default function WorkshopPage() {
  const router = useRouter();
  const { createJoke } = useJokes();
  const {
    generateSetups,
    generatePunchlines,
    suggestTags,
    loading,
    error,
  } = useAI();

  const [step, setStep] = useState<"premise" | "setup" | "punchline" | "final">("premise");
  const [premise, setPremise] = useState("");
  const [setups, setSetups] = useState<string[]>([]);
  const [selectedSetup, setSelectedSetup] = useState("");
  const [customSetup, setCustomSetup] = useState("");
  const [punchlines, setPunchlines] = useState<string[]>([]);
  const [selectedPunchline, setSelectedPunchline] = useState("");
  const [customPunchline, setCustomPunchline] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [estimatedTime, setEstimatedTime] = useState(30);

  const handleGenerateSetups = async () => {
    try {
      const suggestions = await generateSetups(premise);
      setSetups(suggestions);
      setStep("setup");
    } catch (err) {
      console.error("Error generating setups:", err);
    }
  };

  const handleSelectSetup = async (setup: string) => {
    setSelectedSetup(setup);
    try {
      const suggestions = await generatePunchlines(setup);
      setPunchlines(suggestions);
      setStep("punchline");
    } catch (err) {
      console.error("Error generating punchlines:", err);
    }
  };

  const handleUseCustomSetup = async () => {
    if (!customSetup) return;
    setSelectedSetup(customSetup);
    try {
      const suggestions = await generatePunchlines(customSetup);
      setPunchlines(suggestions);
      setStep("punchline");
    } catch (err) {
      console.error("Error generating punchlines:", err);
    }
  };

  const handleSelectPunchline = async (punchline: string) => {
    setSelectedPunchline(punchline);
    try {
      const suggestedTags = await suggestTags(selectedSetup, punchline);
      setTags(suggestedTags);
    } catch (err) {
      console.error("Error suggesting tags:", err);
    }
    setStep("final");
  };

  const handleSaveJoke = () => {
    const finalSetup = selectedSetup || customSetup;
    const finalPunchline = selectedPunchline || customPunchline;

    if (!title || !finalSetup || !finalPunchline) {
      alert("Please fill in all required fields");
      return;
    }

    const newJoke = createJoke({
      title,
      setup: finalSetup,
      punchline: finalPunchline,
      tags,
      estimatedTime,
      energy: "medium",
      type: "observational",
      status: "draft",
      versions: [],
      performances: [],
      notes: `Created from premise: ${premise}`,
    });

    router.push(`/editor/${newJoke.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Joke Workshop ✨</h1>
        <p className="text-muted">Create your next killer joke with AI assistance</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 animate-fade-in">
        {["premise", "setup", "punchline", "final"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <Badge variant={step === s ? "default" : "outline"}>
              Step {i + 1}: {s}
            </Badge>
            {i < 3 && <span className="text-muted">→</span>}
          </div>
        ))}
      </div>

      {/* Step 1: Premise */}
      {step === "premise" && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step 1: Enter Your Premise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
                placeholder="What&apos;s your observation? What&apos;s funny about this topic?"
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              rows={4}
            />
            <Button onClick={handleGenerateSetups} disabled={!premise || loading}>
              {loading ? <AILoadingIndicator /> : "Generate Setups with AI"}
            </Button>
            {error && <p className="text-error text-sm">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Setup */}
      {step === "setup" && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step 2: Choose or Write Your Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {setups.map((setup, i) => (
                <Card
                  key={i}
                  className="cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => handleSelectSetup(setup)}
                >
                  <CardContent className="p-4">
                    <p>{setup}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="glass rounded-xl p-4 mt-4">
              <p className="text-sm text-muted mb-2">Or write your own:</p>
              <Textarea
                placeholder="Write your custom setup..."
                value={customSetup}
                onChange={(e) => setCustomSetup(e.target.value)}
                rows={3}
              />
              <Button onClick={handleUseCustomSetup} disabled={!customSetup || loading} className="mt-2">
                {loading ? <AILoadingIndicator /> : "Use This Setup"}
              </Button>
            </div>

            {loading && <AILoadingIndicator />}
            {error && <p className="text-error text-sm">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Punchline */}
      {step === "punchline" && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step 3: Choose or Write Your Punchline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass rounded-xl p-4 mb-4">
              <p className="text-sm text-muted mb-1">Setup:</p>
              <p>{selectedSetup}</p>
            </div>

            <div className="grid gap-3">
              {punchlines.map((punchline, i) => (
                <Card
                  key={i}
                  className="cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => handleSelectPunchline(punchline)}
                >
                  <CardContent className="p-4">
                    <p>{punchline}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="glass rounded-xl p-4 mt-4">
              <p className="text-sm text-muted mb-2">Or write your own:</p>
              <Textarea
                placeholder="Write your custom punchline..."
                value={customPunchline}
                onChange={(e) => setCustomPunchline(e.target.value)}
                rows={3}
              />
              <Button onClick={() => {
                setSelectedPunchline(customPunchline);
                setStep("final");
              }} disabled={!customPunchline} className="mt-2">
                Use This Punchline
              </Button>
            </div>

            {error && <p className="text-error text-sm">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Final Details */}
      {step === "final" && (
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Step 4: Finalize Your Joke</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="glass rounded-xl p-4 space-y-2">
              <p><strong>Setup:</strong> {selectedSetup}</p>
              <p><strong>Punchline:</strong> {selectedPunchline || customPunchline}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Joke Title</label>
              <Input
                placeholder="Give your joke a memorable title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Time (seconds)
              </label>
              <Input
                type="number"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value))}
                min={10}
                max={300}
              />
            </div>

            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Suggested Tags (AI-generated)
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <Badge key={i} variant="glass">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSaveJoke} size="lg">
                Save Joke
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
