"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MigrationWizardProps {
  onComplete: () => void;
}

export function MigrationWizard({ onComplete }: MigrationWizardProps) {
  const [step, setStep] = useState(1);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{ jokesCreated: number; routinesCreated: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const detectLocalStorageData = () => {
    const jokes = localStorage.getItem("jokes");
    const routines = localStorage.getItem("routines");

    const jokeCount = jokes ? JSON.parse(jokes).length : 0;
    const routineCount = routines ? JSON.parse(routines).length : 0;

    return { jokeCount, routineCount };
  };

  const { jokeCount, routineCount } = detectLocalStorageData();
  const hasLocalData = jokeCount > 0 || routineCount > 0;

  const handleExport = () => {
    const jokes = localStorage.getItem("jokes") || "[]";
    const routines = localStorage.getItem("routines") || "[]";

    const exportData = {
      jokes: JSON.parse(jokes),
      routines: JSON.parse(routines),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comedy-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setStep(3);
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);

    try {
      const jokes = JSON.parse(localStorage.getItem("jokes") || "[]");
      const routines = JSON.parse(localStorage.getItem("routines") || "[]");

      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jokes, routines }),
      });

      if (!response.ok) {
        throw new Error("Migration failed");
      }

      const data = await response.json();
      setResult(data);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Migration failed");
    } finally {
      setMigrating(false);
    }
  };

  const handleClearLocalStorage = () => {
    localStorage.removeItem("jokes");
    localStorage.removeItem("routines");
    setStep(5);
  };

  const handleComplete = () => {
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!hasLocalData) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>No Local Data Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted">
            You do not have any local data to migrate. You can start using the app right away!
          </p>
          <Button onClick={handleComplete}>Get Started</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                s <= step ? "bg-primary text-white" : "bg-muted-bg text-muted"
              }`}
            >
              {s}
            </div>
            {s < 5 && <div className={`w-16 h-1 ${s < step ? "bg-primary" : "bg-muted-bg"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Cloud! ☁️</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              We have detected that you have local data that can be migrated to the cloud.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Your Local Data:</h3>
              <ul className="space-y-1">
                <li>🎤 {jokeCount} jokes</li>
                <li>🎯 {routineCount} routines</li>
              </ul>
            </div>
            <p className="text-sm text-muted">By migrating to the cloud, you will be able to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Access your jokes from any device</li>
              <li>Never lose your data</li>
              <li>Collaborate with other comedians (coming soon)</li>
              <li>Get better performance and reliability</li>
            </ul>
            <div className="flex gap-3">
              <Button onClick={() => setStep(2)}>Continue with Migration</Button>
              <Button variant="secondary" onClick={handleSkip}>
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Backup */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Backup Your Data 💾</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Before migrating, we recommend creating a backup of your local data.</p>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm">
                ⚠️ <strong>Important:</strong> This backup will allow you to restore your data if
                anything goes wrong during migration.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExport}>Download Backup</Button>
              <Button variant="secondary" onClick={() => setStep(3)}>
                Skip Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Migrate */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Migrate 🚀</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We are ready to migrate your data to the cloud. This process will:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Upload your {jokeCount} jokes to the database</li>
              <li>Upload your {routineCount} routines to the database</li>
              <li>Preserve all your versions and performance data</li>
              <li>Keep your local data intact (you can clear it later)</li>
            </ul>
            {error && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                <p>
                  <strong>Error:</strong> {error}
                </p>
                <p className="text-sm mt-2">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={handleMigrate} disabled={migrating}>
                {migrating ? "Migrating..." : "Start Migration"}
              </Button>
              <Button variant="secondary" onClick={handleSkip} disabled={migrating}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && result && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="font-semibold text-green-800 mb-2">Successfully migrated:</p>
              <ul className="space-y-1 text-green-700">
                <li>✓ {result.jokesCreated} jokes</li>
                <li>✓ {result.routinesCreated} routines</li>
              </ul>
            </div>
            <p className="text-sm">
              Your data is now safely stored in the cloud and synced with your account.
            </p>
            <p className="text-sm text-muted">
              Your local data is still in your browser. You can clear it now or keep it as a backup.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleClearLocalStorage}>Clear Local Data</Button>
              <Button variant="secondary" onClick={handleComplete}>
                Keep Local Data & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Done */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>All Set! 🎭</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Your migration is complete and your local storage has been cleared.
            </p>
            <p className="text-sm text-muted">
              You can now use the app with your cloud-synced data from any device!
            </p>
            <Button onClick={handleComplete}>Start Using the App</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
