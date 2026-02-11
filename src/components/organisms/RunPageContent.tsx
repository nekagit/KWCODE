"use client";

import { useCallback, useEffect, useState } from "react";
import { invoke, isTauri } from "@/lib/tauri";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRunState } from "@/context/run-state";
import { getApiErrorMessage } from "@/lib/utils";
import { RunPageHeader } from "@/components/molecules/LayoutAndNavigation/RunPageHeader/RunPageHeader";
import { RunFromFeatureCard } from "@/components/molecules/CardsAndDisplay/RunFromFeatureCard/RunFromFeatureCard";
import { PromptSelectionCard } from "@/components/molecules/CardsAndDisplay/PromptSelectionCard/PromptSelectionCard";
import { ProjectSelectionCard } from "@/components/molecules/CardsAndDisplay/ProjectSelectionCard/ProjectSelectionCard";
import { RunLabelCard } from "@/components/molecules/CardsAndDisplay/RunLabelCard/RunLabelCard";
import { RunControls } from "@/components/molecules/ControlsAndButtons/RunControls/RunControls";

interface Feature {
  id: string;
  title: string;
  prompt_ids: number[];
  project_paths: string[];
}

export function RunPageContent() {
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
          feature.project_paths.length > 0 ? feature.project_paths : allProjects // Changed to allProjects
        );
      }
    },
    [setSelectedPromptIds, setActiveProjects, allProjects]
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
      <RunPageHeader />

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
        <RunFromFeatureCard
          features={features}
          selectedFeatureId={selectedFeatureId}
          applyFeature={applyFeature}
        />
      )}

      {/* Prompts */}
      <PromptSelectionCard
        prompts={prompts}
        selectedPromptIds={selectedPromptIds}
        setSelectedPromptIds={setSelectedPromptIds}
      />

      {/* Projects */}
      <ProjectSelectionCard
        allProjects={allProjects}
        activeProjects={activeProjects}
        toggleProject={toggleProject}
      />

      {/* Run label (optional) */}
      <RunLabelCard runLabel={runLabel} setRunLabel={setRunLabel} />

      {/* Start / Stop */}
      <RunControls
        handleStart={handleStart}
        handleStop={handleStop}
        canStart={canStart}
        running={running}
      />
    </div>
  );
}
