"use client";

import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { CreatePromptButton } from "@/components/atoms/CreatePromptButton";
import { EditPromptButton } from "@/components/atoms/EditPromptButton";
import { GeneratePromptWithAiButton } from "@/components/atoms/GeneratePromptWithAiButton";

interface PromptActionButtonsProps {
  openCreate: () => void;
  openEdit: () => void;
  setGenerateOpen: (open: boolean) => void;
  canEdit: boolean;
}

export function PromptActionButtons({
  openCreate,
  openEdit,
  setGenerateOpen,
  canEdit,
}: PromptActionButtonsProps) {
  return (
    <ButtonGroup alignment="left">
      <CreatePromptButton onClick={openCreate} />
      <EditPromptButton
        onClick={openEdit}
        disabled={!canEdit}
        title={canEdit ? "Edit selected prompt" : "Select exactly one prompt to edit"}
      />
      <GeneratePromptWithAiButton onClick={() => setGenerateOpen(true)} />
    </ButtonGroup>
  );
}
