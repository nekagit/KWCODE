import { Play, Loader2, Plus, MessageSquare, Folders, Layers, ScrollText, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Feature } from "@/types/project";
import type { RunInfo } from "@/types/run";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { AddTicketButton } from "@/components/atoms/buttons/AddTicketButton";
import { RunFeatureButton } from "@/components/atoms/buttons/RunFeatureButton";
import { CreatePromptRecordButton } from "@/components/atoms/buttons/CreatePromptButton";
import { ActiveReposButton } from "@/components/atoms/buttons/ActiveReposButton";
import { FeaturesButton } from "@/components/atoms/buttons/FeaturesButton";
import { ViewLogButton } from "@/components/atoms/buttons/ViewLogButton";

interface QuickActionButtonsProps {
  features: Feature[];
  runningRuns: RunInfo[];
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
      <CreatePromptRecordButton onClick={() => navigateToTab("prompts")} />
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
