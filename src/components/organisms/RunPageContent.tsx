"use client";

import { useCallback, useEffect, useState } from "react";
import { invoke, isTauri } from "@/lib/tauri";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRunState } from "@/context/run-state";
import { getApiErrorMessage } from "@/lib/utils";
import { RunPageHeader } from "@/components/molecules/LayoutAndNavigation/RunPageHeader";
import { RunFromFeatureCard } from "@/components/molecules/CardsAndDisplay/RunFromFeatureCard";
import { PromptRecordSelectionCard } from "@/components/molecules/CardsAndDisplay/PromptRecordSelectionCard";
import { ProjectSelectionCard } from "@/components/molecules/CardsAndDisplay/ProjectSelectionCard";
import { RunLabelCard } from "@/components/molecules/CardsAndDisplay/RunLabelCard";
import { RunControls } from "@/components/molecules/ControlsAndButtons/RunControls";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import type { Feature } from "@/types/project";
export function RunPageContent() {
  const {
    error,
    dataWarning,
    setError,
    prompts,
    selectedPromptRecordIds,
    setSelectedPromptRecordIds,
    allProjects,
    activeProjects,
    setActiveProjects,
    toggleProject,
    saveActiveProjects,
    runWithParams,
    stopScript,
    runningRuns,
    isTauriEnv,
    featureQueue,
    addFeatureToQueue,
    removeFeatureFromQueue,
    clearFeatureQueue,
    runFeatureQueue,
  } = useRunState();

  const [features, setFeatures] = useState<Feature[]>([]);
  const [runLabel, setRunLabel] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const running = runningRuns.some((r) => r.status === "running");

  const loadFeatures = useCallback(async () => {
    try {
      if (isTauri) {
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
        setSelectedPromptRecordIds(feature.prompt_ids);
        setActiveProjects(
          feature.project_paths.length > 0 ? feature.project_paths : allProjects // Changed to allProjects
        );
      }
    },
    [setSelectedPromptRecordIds, setActiveProjects, allProjects]
  );

  const handleStart = async () => {
    if (selectedPromptRecordIds.length === 0) {
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
      promptIds: selectedPromptRecordIds,
      activeProjects,
      runLabel: runLabel.trim() || null,
    });
  };

  const handleStop = async () => {
    setError(null);
    await stopScript();
  };

  const canStart = selectedPromptRecordIds.length > 0 && activeProjects.length > 0;

  return (
    <ErrorBoundary fallbackTitle="Run page error">
      <div className="space-y-6" data-testid="run-page">
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

        {/* PromptRecords */}
        <PromptRecordSelectionCard
          prompts={prompts}
          selectedPromptRecordIds={selectedPromptRecordIds}
          setSelectedPromptRecordIds={setSelectedPromptRecordIds}
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
    </ErrorBoundary>
  );
}
