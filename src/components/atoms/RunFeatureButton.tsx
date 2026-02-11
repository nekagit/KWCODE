import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import type { Feature } from "@/types/project";
import type { RunningRun } from "@/store/run-store";

interface RunFeatureButtonProps {
  feature: Feature;
  runForFeature: (feature: Feature) => Promise<void>;
  runningRuns: RunningRun[];
}

export const RunFeatureButton: React.FC<RunFeatureButtonProps> = ({
  feature,
  runForFeature,
  runningRuns,
}) => {
  const isRunning = runningRuns.some((r) => r.label === feature.title && r.status === "running");

  return (
    <Button
      variant="default"
      onClick={() => runForFeature(feature)}
      disabled={feature.prompt_ids.length === 0 || isRunning}
    >
      {isRunning ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Play className="h-4 w-4 mr-2" />
      )}
      Run "{feature.title.length > 20 ? feature.title.slice(0, 20) + "…" : feature.title}"
    </Button>
  );
};
