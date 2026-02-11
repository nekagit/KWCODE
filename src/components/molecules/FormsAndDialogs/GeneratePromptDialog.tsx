"use client";

import { Dialog } from "@/components/shared/Dialog";
import { GeneratedPromptDisplay } from "@/components/atoms/displays/GeneratedPromptDisplay";
import { PromptGeneratorForm } from "@/components/atoms/forms/PromptGeneratorForm";

interface GeneratePromptRecordDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  generateDescription: string;
  setGenerateDescription: (description: string) => void;
  handleGenerate: () => Promise<void>;
  generateLoading: boolean;
  generateResult: { title: string; content: string } | null;
  setGenerateResult: (result: { title: string; content: string } | null) => void;
  useGeneratedAndCreate: () => void;
  saveGeneratedAsNew: () => Promise<void>;
  saveLoading: boolean;
}

export function GeneratePromptRecordDialog({
  open,
  setOpen,
  generateDescription,
  setGenerateDescription,
  handleGenerate,
  generateLoading,
  generateResult,
  setGenerateResult,
  useGeneratedAndCreate,
  saveGeneratedAsNew,
  saveLoading,
}: GeneratePromptRecordDialogProps) {
  return (
    <Dialog
      title="Generate prompt with AI"
      onClose={() => setOpen(false)}
      isOpen={open}
    >
      {!generateResult ? (
        <PromptGeneratorForm
          generateDescription={generateDescription}
          setGenerateDescription={setGenerateDescription}
          handleGenerate={handleGenerate}
          generateLoading={generateLoading}
        />
      ) : (
        <GeneratedPromptDisplay
          generateResult={generateResult}
          setGenerateResult={setGenerateResult}
          useGeneratedAndCreate={useGeneratedAndCreate}
          saveGeneratedAsNew={saveGeneratedAsNew}
          saveLoading={saveLoading}
        />
      )}
    </Dialog>
  );
}
