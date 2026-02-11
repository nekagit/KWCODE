import type { Project, Feature } from "@/types/project";
import type { TicketRow } from "@/types/ticket";
import type { PromptRecord } from "@/types/prompt";
import type { RunInfo } from "@/types/run";
import { useRunState } from "@/context/run-state";
import { FeatureManagementCard } from "@/components/molecules/CardsAndDisplay/FeatureManagementCard";

interface FeatureTabContentProps {
  features: Feature[];
  tickets: TicketRow[];
  prompts: PromptRecord[];
  allProjects: string[];
  activeProjects: string[];
  runningRuns: RunInfo[];
  featureQueue: Feature[];
  setError: (error: string | null) => void;
  addFeatureToQueue: (feature: Feature) => void;
  removeFeatureFromQueue: (featureId: string) => void;
  clearFeatureQueue: () => void;
  runFeatureQueue: (activeProjectsFallback: string[]) => Promise<void>;
  runForFeature: (feature: Feature) => Promise<void>;
  saveFeatures: (next: Feature[]) => Promise<void>;
}

export function FeatureTabContent({
  features,
  tickets,
  prompts,
  allProjects,
  activeProjects,
  runningRuns,
  featureQueue,
  setError,
  addFeatureToQueue,
  removeFeatureFromQueue,
  clearFeatureQueue,
  runFeatureQueue,
  runForFeature,
  saveFeatures,
}: FeatureTabContentProps) {
  return (
    <div className="mt-0">
      <FeatureManagementCard
        features={features}
        tickets={tickets}
        prompts={prompts}
        allProjects={allProjects}
        activeProjects={activeProjects}
        runningRuns={runningRuns}
        featureQueue={featureQueue}
        setError={setError}
        addFeatureToQueue={addFeatureToQueue}
        removeFeatureFromQueue={removeFeatureFromQueue}
        clearFeatureQueue={clearFeatureQueue}
        runFeatureQueue={runFeatureQueue}
        runForFeature={runForFeature}
        saveFeatures={saveFeatures}
      />
    </div>
  );
}
