"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useRunState } from "@/context/run-state";
import { Play, Square } from "lucide-react";

export default function PromptsPage() {
  const {
    error,
    prompts,
    selectedPromptIds,
    setSelectedPromptIds,
    activeProjects,
    runScript,
    stopScript,
    runningRuns,
  } = useRunState();

  const running = runningRuns.some((r) => r.status === "running");

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prompts</CardTitle>
          <CardDescription>
            Select prompt IDs to run (script -p ID ...). Configure timing and
            projects on the Configuration page and Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
              >
                <Checkbox
                  checked={selectedPromptIds.includes(p.id)}
                  onCheckedChange={(checked) => {
                    setSelectedPromptIds((prev) =>
                      checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                    );
                  }}
                />
                <span className="text-sm">
                  {p.id}: {p.title}
                </span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={runScript}
          disabled={
            selectedPromptIds.length === 0 || activeProjects.length === 0
          }
        >
          <Play className="mr-2 h-4 w-4" />
          Start
        </Button>
        <Button
          variant="destructive"
          onClick={stopScript}
          disabled={!running}
        >
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
        {(selectedPromptIds.length === 0 || activeProjects.length === 0) && (
          <span className="text-sm text-muted-foreground">
            Select at least one prompt and one project (on Dashboard → Projects)
            to run.
          </span>
        )}
      </div>
    </div>
  );
}
