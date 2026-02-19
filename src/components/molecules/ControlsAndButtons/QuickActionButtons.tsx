/** Quick Action Buttons component. */
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { CreatePromptRecordButton } from "@/components/atoms/buttons/CreatePromptButton";
import { ActiveReposButton } from "@/components/atoms/buttons/ActiveReposButton";

interface QuickActionButtonsProps {
  navigateToTab: (tab: "projects" | "dashboard" | "prompts" | "all" | "data") => void;
}

export function QuickActionButtons({
  navigateToTab,
}: QuickActionButtonsProps) {
  return (
    <ButtonGroup alignment="left">
      <CreatePromptRecordButton onClick={() => navigateToTab("prompts")} />
      <ActiveReposButton onClick={() => navigateToTab("projects")} />
    </ButtonGroup>
  );
}
