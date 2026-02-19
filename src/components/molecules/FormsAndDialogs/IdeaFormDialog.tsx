"use client";

/** Idea Form Dialog component. */
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { IdeaFormFields } from "@/components/atoms/forms/IdeaFormFields";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("FormsAndDialogs/IdeaFormDialog.tsx");

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface IdeaFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formDescription: string;
  setFormDescription: (description: string) => void;
  formCategory: keyof IdeaCategoryLabels;
  setFormCategory: (category: keyof IdeaCategoryLabels) => void;
  handleSave: () => Promise<void>;
  saveLoading: boolean;
  CATEGORY_LABELS: IdeaCategoryLabels;
}

export function IdeaFormDialog({
  open,
  setOpen,
  title,
  description,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  formCategory,
  setFormCategory,
  handleSave,
  saveLoading,
  CATEGORY_LABELS,
}: IdeaFormDialogProps) {
  return (
    <Dialog
      title={title}
      onClose={() => setOpen(false)}
      isOpen={open}
      actions={
        <ButtonGroup alignment="right">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveLoading || !formTitle.trim()}>
            {saveLoading ? <Loader2 className={classes[0]} /> : null}
            Save
          </Button>
        </ButtonGroup>
      }
    >
      <p className={classes[1]}>{description}</p>
      <IdeaFormFields
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        CATEGORY_LABELS={CATEGORY_LABELS}
      />
    </Dialog>
  );
}
