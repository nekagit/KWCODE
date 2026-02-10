import { useRouter } from "next/navigation";
import type { Feature } from "@/types/project";
import type { RunInfo as RunningRun } from "@/types/run";
import { QuickActionCard } from "@/components/molecules/QuickActionCard/QuickActionCard";
import { QuickActionButtons } from "@/components/molecules/QuickActionButtons/QuickActionButtons";

interface QuickActionsProps {
  features: Feature[];
  runningRuns: RunningRun[];
  navigateToTab: (tab: "tickets" | "projects" | "feature" | "log" | "dashboard" | "prompts" | "all" | "data") => void;
  runForFeature: (feature: Feature) => Promise<void>;
  setSelectedRunId: (id: string | null) => void;
  router: ReturnType<typeof useRouter>;
}

export function QuickActions({ features, runningRuns, navigateToTab, runForFeature, setSelectedRunId, router }: QuickActionsProps) {
  return (
    <QuickActionCard>
      <QuickActionButtons
        features={features}
        runningRuns={runningRuns}
        navigateToTab={navigateToTab}
        runForFeature={runForFeature}
        setSelectedRunId={setSelectedRunId}
      />
    </QuickActionCard>
  );
}
