/** List item for a definition (architecture/design). */
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Pencil, Trash2 } from "lucide-react";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { ListItemCard } from "@/components/shared/ListItemCard";

interface DefinitionListItemProps {
  record: ArchitectureRecord;
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  onOpenView: (record: ArchitectureRecord) => void;
  onOpenEdit: (record: ArchitectureRecord) => void;
  onDelete: (id: string) => Promise<void>;
}

export const DefinitionListItem: React.FC<DefinitionListItemProps> = ({
  record,
  CATEGORY_LABELS,
  onOpenView,
  onOpenEdit,
  onDelete,
}) => {
  return (
    <ListItemCard
      id={record.id}
      title={record.name}
      subtitle={record.description || "—"}
      badge={CATEGORY_LABELS[record.category]}
      footerButtons={
        <ButtonGroup alignment="right">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onOpenView(record)}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => onOpenEdit(record)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      }
    >
      {/* Additional content or buttons can be placed here if needed */}
    </ListItemCard>
  );
};
