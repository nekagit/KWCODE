"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ArchitectureCategory } from "@/types/architecture";
import { Dialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { ArchitectureEditForm } from "@/components/atoms/architecture/ArchitectureEditForm";

interface ExtraInput {
  key: string;
  value: string;
}

interface ArchitectureEditDialogProps {
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  formName: string;
  setFormName: (name: string) => void;
  formCategory: ArchitectureCategory;
  setFormCategory: (category: ArchitectureCategory) => void;
  formDescription: string;
  setFormDescription: (description: string) => void;
  formPractices: string;
  setFormPractices: (practices: string) => void;
  formScenarios: string;
  setFormScenarios: (scenarios: string) => void;
  formReferences: string;
  setFormReferences: (references: string) => void;
  formAntiPatterns: string;
  setFormAntiPatterns: (antiPatterns: string) => void;
  formExamples: string;
  setFormExamples: (examples: string) => void;
  formExtraInputs: ExtraInput[];
  setFormExtraInputs: React.Dispatch<React.SetStateAction<ExtraInput[]>>;
  handleSaveEdit: () => Promise<void>;
  saveLoading: boolean;
  ALL_CATEGORIES: ArchitectureCategory[];
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
}

export function ArchitectureEditDialog({
  editOpen,
  setEditOpen,
  formName,
  setFormName,
  formCategory,
  setFormCategory,
  formDescription,
  setFormDescription,
  formPractices,
  setFormPractices,
  formScenarios,
  setFormScenarios,
  formReferences,
  setFormReferences,
  formAntiPatterns,
  setFormAntiPatterns,
  formExamples,
  setFormExamples,
  formExtraInputs,
  setFormExtraInputs,
  handleSaveEdit,
  saveLoading,
  ALL_CATEGORIES,
  CATEGORY_LABELS,
}: ArchitectureEditDialogProps) {
  return (
    <Dialog
      title="Edit architecture definition"
      onClose={() => setEditOpen(false)}
      isOpen={editOpen}
      actions={
        <ButtonGroup alignment="right">
          <Button variant="outline" onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} disabled={saveLoading || !formName.trim()}>
            {saveLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save
          </Button>
        </ButtonGroup>
      }
    >
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Update fields and add more inputs: references, anti-patterns, examples, or custom key-value inputs.
      </p>
      <ArchitectureEditForm
        formName={formName}
        setFormName={setFormName}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formPractices={formPractices}
        setFormPractices={setFormPractices}
        formScenarios={formScenarios}
        setFormScenarios={setFormScenarios}
        formReferences={formReferences}
        setFormReferences={setFormReferences}
        formAntiPatterns={formAntiPatterns}
        setFormAntiPatterns={setFormAntiPatterns}
        formExamples={formExamples}
        setFormExamples={setFormExamples}
        formExtraInputs={formExtraInputs}
        setFormExtraInputs={setFormExtraInputs}
        ALL_CATEGORIES={ALL_CATEGORIES}
        CATEGORY_LABELS={CATEGORY_LABELS}
      />
    </Dialog>
  );
}
