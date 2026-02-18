"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Download, Copy, Hash, FileJson } from "lucide-react";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { Dialog } from "@/components/shared/Dialog";
import {
  Dialog as ConfirmDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { downloadArchitectureRecord } from "@/lib/download-architecture-record";
import { downloadArchitectureRecordAsJson } from "@/lib/download-architecture-record-json";
import { copyTextToClipboard } from "@/lib/copy-to-clipboard";
import { architectureRecordToMarkdown } from "@/lib/architecture-to-markdown";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { ArchitectureDetailsDisplay } from "@/components/atoms/architecture/ArchitectureDetailsDisplay";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("FormsAndDialogs/ArchitectureViewDialog.tsx");

interface ArchitectureViewDialogProps {
  viewOpen: boolean;
  setViewOpen: (open: boolean) => void;
  viewItem: ArchitectureRecord | null;
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  openEdit: (record: ArchitectureRecord) => void;
  handleDelete: (id: string) => Promise<void>;
}

export function ArchitectureViewDialog({
  viewOpen,
  setViewOpen,
  viewItem,
  CATEGORY_LABELS,
  openEdit,
  handleDelete,
}: ArchitectureViewDialogProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const onConfirmDelete = async () => {
    if (!viewItem) return;
    await handleDelete(viewItem.id);
    setDeleteConfirmOpen(false);
    setViewOpen(false);
  };

  return (
    <>
    <Dialog
      title={viewItem?.name || "Architecture Details"}
      onClose={() => setViewOpen(false)}
      isOpen={viewOpen}
      actions={
        viewItem && (
          <ButtonGroup alignment="right">
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => copyTextToClipboard(viewItem.id)}
              title="Copy ID"
            >
              <Hash className={classes[0]} />
              Copy ID
            </Button>
            <Button
              variant="outline"
              onClick={() => copyTextToClipboard(architectureRecordToMarkdown(viewItem))}
              title="Copy architecture as Markdown"
            >
              <Copy className={classes[0]} />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadArchitectureRecord(viewItem)}
              title="Download as Markdown"
            >
              <Download className={classes[0]} />
              Download
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadArchitectureRecordAsJson(viewItem)}
              title="Download as JSON"
            >
              <FileJson className={classes[0]} />
              Download as JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setViewOpen(false);
                openEdit(viewItem);
              }}
            >
              <Pencil className={classes[0]} />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className={classes[0]} />
              Delete
            </Button>
          </ButtonGroup>
        )
      }
    >
      {viewItem ? (
        <ArchitectureDetailsDisplay viewItem={viewItem} CATEGORY_LABELS={CATEGORY_LABELS} />
      ) : (
        <p>No architecture selected.</p>
      )}
    </Dialog>
    <ConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete architecture?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This architecture will be removed. This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete architecture
          </Button>
        </DialogFooter>
      </DialogContent>
    </ConfirmDialog>
    </>
  );
}
