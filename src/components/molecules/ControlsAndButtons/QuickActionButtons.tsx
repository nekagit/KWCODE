import { Play, Loader2, Plus, MessageSquare, Folders, Layers, ScrollText, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shadcn/button";
import type { Feature } from "@/types/project";
import type { RunningRun } from "@/store/run-store";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { AddTicketButton } from "@/components/atoms/AddTicketButton";
import { RunFeatureButton } from "@/components/atoms/RunFeatureButton";
import { PromptsButton } from "@/components/atoms/PromptsButton";
import { ActiveReposButton } from "@/components/atoms/ActiveReposButton";
import { FeaturesButton } from "@/components/atoms/FeaturesButton";
import { ViewLogButton } from "@/components/atoms/ViewLogButton";

interface QuickActionButtonsProps {
  features: Feature[];
  runningRuns: RunningRun[];
  navigateToTab: (tab: "tickets" | "projects" | "feature" | "log" | "dashboard" | "prompts" | "all" | "data") => void;
  runForFeature: (feature: Feature) => Promise<void>;
  setSelectedRunId: (id: string | null) => void;
}

export function QuickActionButtons({
  features,
  runningRuns,
  navigateToTab,
  runForFeature,
  setSelectedRunId,
}: QuickActionButtonsProps) {
  return (
    <ButtonGroup alignment="left">
      <AddTicketButton onClick={() => navigateToTab("tickets")} />
      {features.length > 0 && (
        <RunFeatureButton
          feature={features[0]}
          runForFeature={runForFeature}
          runningRuns={runningRuns}
        />
      )}
      <PromptsButton onClick={() => navigateToTab("prompts")} />
      <ActiveReposButton onClick={() => navigateToTab("projects")} />
      <FeaturesButton onClick={() => navigateToTab("feature")} />
      <ViewLogButton
        onClick={() => navigateToTab("log")}
        runningRuns={runningRuns}
        setSelectedRunId={setSelectedRunId}
      />
    </ButtonGroup>
  );
}
