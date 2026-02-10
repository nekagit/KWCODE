"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Sparkles } from "lucide-react";

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
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={openCreate}>
        <Plus className="h-4 w-4" />
        Create prompt
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={openEdit}
        disabled={!canEdit}
        title={canEdit ? "Edit selected prompt" : "Select exactly one prompt to edit"}
      >
        <Pencil className="h-4 w-4" />
        Edit prompt
      </Button>
      <Button variant="outline" size="sm" onClick={() => setGenerateOpen(true)}>
        <Sparkles className="h-4 w-4" />
        Generate with AI
      </Button>
    </div>
  );
}
