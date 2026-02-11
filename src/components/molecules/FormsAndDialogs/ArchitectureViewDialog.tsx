"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { Dialog } from "@/components/shared/Dialog";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { ArchitectureDetailsDisplay } from "@/components/atoms/ArchitectureDetailsDisplay";

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
  return (
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
              onClick={() => {
                setViewOpen(false);
                openEdit(viewItem);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(viewItem.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
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
  );
}
