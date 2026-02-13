import { Play, Loader2, Plus, MessageSquare, Folders, ScrollText, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RunInfo } from "@/types/run";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { AddTicketButton } from "@/components/atoms/buttons/AddTicketButton";
import { CreatePromptRecordButton } from "@/components/atoms/buttons/CreatePromptButton";
import { ActiveReposButton } from "@/components/atoms/buttons/ActiveReposButton";
import { ViewLogButton } from "@/components/atoms/buttons/ViewLogButton";

interface QuickActionButtonsProps {
  runningRuns: RunInfo[];
  navigateToTab: (tab: "tickets" | "projects" | "log" | "dashboard" | "prompts" | "all" | "data") => void;
  setSelectedRunId: (id: string | null) => void;
}

export function QuickActionButtons({
  runningRuns,
  navigateToTab,
  setSelectedRunId,
}: QuickActionButtonsProps) {
  return (
    <ButtonGroup alignment="left">
      <AddTicketButton onClick={() => navigateToTab("tickets")} />
      <CreatePromptRecordButton onClick={() => navigateToTab("prompts")} />
      <ActiveReposButton onClick={() => navigateToTab("projects")} />
      <ViewLogButton
        onClick={() => navigateToTab("log")}
        runningRuns={runningRuns}
        setSelectedRunId={setSelectedRunId}
      />
    </ButtonGroup>
  );
}
