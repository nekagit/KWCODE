import { useRouter } from "next/navigation";
import type { RunInfo } from "@/types/run";
import { QuickActionCard } from "@/components/molecules/CardsAndDisplay/QuickActionCard";
import { QuickActionButtons } from "@/components/molecules/ControlsAndButtons/QuickActionButtons";

interface QuickActionsProps {
  runningRuns: RunInfo[];
  navigateToTab: (tab: "tickets" | "projects" | "log" | "dashboard" | "prompts" | "all" | "data") => void;
  setSelectedRunId: (id: string | null) => void;
  router: ReturnType<typeof useRouter>;
}

export function QuickActions({
  runningRuns,
  navigateToTab,
  setSelectedRunId,
  router,
}: QuickActionsProps) {
  return (
    <QuickActionCard>
      <QuickActionButtons
        runningRuns={runningRuns}
        navigateToTab={navigateToTab}
        setSelectedRunId={setSelectedRunId}
      />
    </QuickActionCard>
  );
}
