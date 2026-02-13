"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRunState } from "@/context/run-state";
import { RunPageHeader } from "@/components/molecules/LayoutAndNavigation/RunPageHeader";
import { PromptRecordSelectionCard } from "@/components/molecules/CardsAndDisplay/PromptRecordSelectionCard";
import { ProjectSelectionCard } from "@/components/molecules/CardsAndDisplay/ProjectSelectionCard";
import { RunLabelCard } from "@/components/molecules/CardsAndDisplay/RunLabelCard";
import { RunControls } from "@/components/molecules/ControlsAndButtons/RunControls";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getOrganismClasses } from "./organism-classes";

const c = getOrganismClasses("RunPageContent.tsx");

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
    toggleProject,
    saveActiveProjects,
    runWithParams,
    stopScript,
    runningRuns,
  } = useRunState();

  const [runLabel, setRunLabel] = useState("");

  const running = runningRuns.some((r) => r.status === "running");

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
      <div className={c["0"]} data-testid="run-page">
        <RunPageHeader />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {dataWarning && !error && (
          <Alert variant="default" className={c["1"]}>
            <AlertDescription>{dataWarning}</AlertDescription>
          </Alert>
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
