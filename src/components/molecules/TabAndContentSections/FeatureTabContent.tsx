import type { Project, Prompt, Feature, Ticket } from "@/types/project";
import { FeatureManagementCard } from "@/components/molecules/CardsAndDisplay/FeatureManagementCard.tsx";
import type { RunningRun } from "@/store/run-store";
import { useRunState } from "@/context/run-state";

interface FeatureTabContentProps {
  features: Feature[];
  tickets: Ticket[];
  prompts: Prompt[];
  allProjects: string[];
  activeProjects: string[];
  runningRuns: RunningRun[];
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
            runFeatureQueue={activeProjects}
        runForFeature={runForFeature}
        saveFeatures={saveFeatures}
      />
    </div>
  );
}
