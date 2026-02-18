"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { FileJson, Hash, Loader2, Pencil, Trash2, Wand2 } from "lucide-react";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { downloadIdeaAsJson } from "@/lib/download-idea-as-json";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: keyof IdeaCategoryLabels;
  source: "template" | "ai" | "manual";
  created_at?: string;
  updated_at?: string;
}

interface IdeaActionsProps {
  idea: IdeaRecord;
  CATEGORY_LABELS: IdeaCategoryLabels;
  generatingProjectIdeaId: number | null;
  onGenerateProject: (ideaId: number) => Promise<void>;
  onOpenEdit: (idea: IdeaRecord) => void;
  onDelete: (ideaId: number) => Promise<void>;
}

export const IdeaActions: React.FC<IdeaActionsProps> = ({
  idea,
  CATEGORY_LABELS,
  generatingProjectIdeaId,
  onGenerateProject,
  onOpenEdit,
  onDelete,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const onConfirmDelete = async () => {
    await onDelete(idea.id);
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <ButtonGroup alignment="right">
        <Button
          size="sm"
          variant="default"
          title="Generate a full project from this idea (prompts, tickets, design, architecture)"
          disabled={generatingProjectIdeaId !== null}
          onClick={() => onGenerateProject(idea.id)}
        >
          {generatingProjectIdeaId === idea.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="h-4 w-4" />
          )}
          <span className="ml-1.5 sr-only sm:not-sr-only">Generate project</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          title="Copy idea ID"
          aria-label="Copy idea ID"
          onClick={() => copyTextToClipboard(String(idea.id))}
        >
          <Hash className="h-4 w-4" />
          <span className="ml-1.5 sr-only sm:not-sr-only">Copy ID</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          title="Download as JSON"
          aria-label="Download idea as JSON"
          onClick={() => downloadIdeaAsJson(idea)}
        >
          <FileJson className="h-4 w-4" />
          <span className="ml-1.5 sr-only sm:not-sr-only">Download as JSON</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0"
          onClick={() => onOpenEdit(idea)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 text-destructive hover:text-destructive"
          title="Delete idea"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </ButtonGroup>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete idea?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This idea will be removed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete}>
              Delete idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
