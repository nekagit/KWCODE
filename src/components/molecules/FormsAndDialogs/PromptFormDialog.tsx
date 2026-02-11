"use client";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { PromptFormFields } from "@/components/atoms/PromptFormFields";
import { Loader2 } from "lucide-react";

interface PromptFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formContent: string;
  setFormContent: (content: string) => void;
  handleSave: () => Promise<void>;
  saveLoading: boolean;
}

export function PromptFormDialog({
  open,
  setOpen,
  title,
  description,
  formTitle,
  setFormTitle,
  formContent,
  setFormContent,
  handleSave,
  saveLoading,
}: PromptFormDialogProps) {
  return (
    <Dialog
      title={title}
      onClose={() => setOpen(false)}
      isOpen={open}
      description={description}
      actions={
        <ButtonGroup alignment="right">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formTitle.trim() || saveLoading}>
            {saveLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save
          </Button>
        </ButtonGroup>
      }
    >
      <PromptFormFields
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formContent={formContent}
        setFormContent={setFormContent}
      />
    </Dialog>
  );
}
