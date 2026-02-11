"use client";

import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { CreatePromptButton } from "@/components/atoms/buttons/CreatePromptButton";
import { EditPromptButton } from "@/components/atoms/buttons/EditPromptButton";
import { GeneratePromptButton } from "@/components/atoms/buttons/GeneratePromptButton";

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
      <CreatePromptButton onClick={openCreate} />
      <EditPromptButton
        onClick={openEdit}
        disabled={!canEdit}
        title={canEdit ? "Edit selected prompt" : "Select exactly one prompt to edit"}
      />
      <GeneratePromptButton onClick={() => setGenerateOpen(true)} />
    </ButtonGroup>
  );
}
