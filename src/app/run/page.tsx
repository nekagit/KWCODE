"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { invoke, isTauri } from "@/lib/tauri";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Square, Layers, MessageSquare, Folders } from "lucide-react";
import { useRunState } from "@/context/run-state";
import { getApiErrorMessage } from "@/lib/utils";

interface Feature {
  id: string;
  title: string;
  prompt_ids: number[];
  project_paths: string[];
}

export default function RunPage() {
  const {
    error,
    dataWarning,
    setError,
    prompts,
    selectedPromptIds,
    setSelectedPromptIds,
    allProjects,
    activeProjects,
    setActiveProjects,
    toggleProject,
    saveActiveProjects,
    runWithParams,
    stopScript,
    runningRuns,
    isTauriEnv,
  } = useRunState();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [runLabel, setRunLabel] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const running = runningRuns.some((r) => r.status === "running");

  const loadFeatures = useCallback(async () => {
    try {
      if (isTauri()) {
        const list = await invoke<Feature[]>("get_features");
        setFeatures(list);
      } else {
        const res = await fetch("/api/data");
        if (!res.ok) {
          setError(await getApiErrorMessage(res.clone()));
          return;
        }
        const data = await res.json();
        setFeatures(Array.isArray(data.features) ? data.features : []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [setError]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const applyFeature = useCallback(
    (feature: Feature | null) => {
      setSelectedFeatureId(feature?.id ?? null);
      if (feature) {
        setSelectedPromptIds(feature.prompt_ids);
        setActiveProjects(
          feature.project_paths.length > 0 ? feature.project_paths : activeProjects
        );
      }
    },
    [setSelectedPromptIds, setActiveProjects, activeProjects]
  );

  const handleStart = async () => {
    if (selectedPromptIds.length === 0) {
      setError("Select at least one prompt");
      return;
    }
    if (activeProjects.length === 0) {
      setError("Select at least one project");
      return;
    }
    setError(null);
    await saveActiveProjects();
    await runWithParams({
      promptIds: selectedPromptIds,
      activeProjects,
      runLabel: runLabel.trim() || null,
    });
  };

  const handleStop = async () => {
    setError(null);
    await stopScript();
  };

  const canStart = selectedPromptIds.length > 0 && activeProjects.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Run</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Set prompts, projects, and optional feature to run{" "}
          <code className="text-xs bg-muted px-1 rounded">run_prompts_all_projects.sh</code>.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {dataWarning && !error && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertDescription>{dataWarning}</AlertDescription>
        </Alert>
      )}

      {/* Run from feature */}
      {features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Run from feature
            </CardTitle>
            <CardDescription>
              Prefill prompts and projects from a feature (tickets linked to prompts and projects).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedFeatureId ?? "__none__"}
              onValueChange={(id) => {
                if (id === "__none__") {
                  applyFeature(null);
                  return;
                }
                const f = features.find((x) => x.id === id) ?? null;
                applyFeature(f);
              }}
            >
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a feature (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-muted-foreground">None</span>
                </SelectItem>
                {features.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.title} ({f.prompt_ids.length} prompts, {f.project_paths.length} projects)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Prompts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompts
          </CardTitle>
          <CardDescription>
            Select at least one prompt to run (script <code className="text-xs">-p ID ...</code>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px] rounded-md border p-3">
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
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Folders className="h-4 w-4" />
            Projects
          </CardTitle>
          <CardDescription>
            Select at least one project to run the script against (Dashboard → Projects also saves
            this list).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[180px] rounded-md border p-3">
            <div className="flex flex-wrap gap-2">
              {allProjects.map((path) => (
                <label
                  key={path}
                  className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={activeProjects.includes(path)}
                    onCheckedChange={() => toggleProject(path)}
                  />
                  <span className="text-sm truncate max-w-[320px]" title={path}>
                    {path.split("/").pop() ?? path}
                  </span>
                </label>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Run label (optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run label</CardTitle>
          <CardDescription>
            Optional name for this run (shown in running terminals and log).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g. Manual run"
            value={runLabel}
            onChange={(e) => setRunLabel(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Start / Stop */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={handleStart} disabled={!canStart}>
          <Play className="mr-2 h-4 w-4" />
          Start
        </Button>
        <Button variant="destructive" onClick={handleStop} disabled={!running}>
          <Square className="mr-2 h-4 w-4" />
          Stop
        </Button>
        {!canStart && (
          <span className="text-sm text-muted-foreground">
            Select at least one prompt and one project to run.
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Timing (delays between operations) is configured on the{" "}
        <Link href="/configuration" className="underline hover:text-foreground">
          Configuration
        </Link>{" "}
        page. View output in the{" "}
        <Link href="/?tab=log" className="underline hover:text-foreground">
          Log
        </Link>{" "}
        tab.
      </p>
    </div>
  );
}
