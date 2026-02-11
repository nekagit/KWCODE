import React from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { ListItemCard } from "@/components/shared/ListItemCard";

interface AiArchitectureListItemProps {
  item: ArchitectureRecord;
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  onAddFromAi: (item: ArchitectureRecord) => Promise<void>;
}

export const AiArchitectureListItem: React.FC<AiArchitectureListItemProps> = ({
  item,
  CATEGORY_LABELS,
  onAddFromAi,
}) => {
  return (
    <ListItemCard
      id={item.id}
      title={item.name}
      subtitle={item.description}
      badge={CATEGORY_LABELS[item.category]}
      footerButtons={
        <Button size="sm" variant="outline" onClick={() => onAddFromAi(item)}>
          <Copy className="h-4 w-4 mr-1" />
          Add
        </Button>
      }
    />
  );
};
