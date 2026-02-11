"use client";

import { Dialog } from "@/components/shared/Dialog";
import { GeneratedPromptDisplay } from "@/components/atoms/GeneratedPromptDisplay";
import { PromptGeneratorForm } from "@/components/atoms/PromptGeneratorForm";

interface GeneratePromptDialogProps {
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

export function GeneratePromptDialog({
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
}: GeneratePromptDialogProps) {
  return (
    <Dialog
      title="Generate prompt with AI"
      onClose={() => setOpen(false)}
      isOpen={open}
      description={
        "Describe what you want the prompt to do. We'll generate a title and full prompt text you can edit and save."
      }
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
