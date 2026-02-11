import type { Project, PromptRecord, Feature } from "@/types/project";
import type { Ticket } from "@/types/ticket";
import { FeatureManagementCard } from "@/components/molecules/CardsAndDisplay/FeatureManagementCard.tsx";
import type { RunInfo } from "@/types/run";
import { useRunState } from "@/context/run-state";

interface FeatureTabContentProps {
  features: Feature[];
  tickets: Ticket[];
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
