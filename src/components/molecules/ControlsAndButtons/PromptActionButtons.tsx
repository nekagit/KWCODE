"use client";

import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { CreatePromptRecordButton } from "@/components/atoms/buttons/CreatePromptButton";
import { EditPromptButton } from "@/components/atoms/buttons/EditPromptButton";
import { GeneratePromptWithAiButton } from "@/components/atoms/buttons/GeneratePromptWithAiButton";

interface PromptRecordActionButtonsProps {
  openCreate: () => void;
  openEdit: () => void;
  setGenerateOpen: (open: boolean) => void;
  canEdit: boolean;
}

export function PromptRecordActionButtons({
  openCreate,
  openEdit,
  setGenerateOpen,
  canEdit,
}: PromptRecordActionButtonsProps) {
  return (
    <ButtonGroup alignment="left">
      <CreatePromptRecordButton onClick={openCreate} />
      <EditPromptButton
        onClick={openEdit}
        disabled={!canEdit}
        title={canEdit ? "Edit selected prompt" : "Select exactly one prompt to edit"}
      />
      <GeneratePromptWithAiButton onClick={() => setGenerateOpen(true)} />
    </ButtonGroup>
  );
}
