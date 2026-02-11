import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // Keeping shadcn card for now inside the list item as it has specific styling
import { FileText, Pencil, Trash2 } from "lucide-react";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

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
    <li>
      <Card className="bg-muted/30">
        <div className="pt-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{record.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {record.description || "—"}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">{CATEGORY_LABELS[record.category]}</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => onOpenView(record)}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  View details
                </Button>
              </div>
            </div>
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
          </div>
        </div>
      </Card>
    </li>
  );
};
