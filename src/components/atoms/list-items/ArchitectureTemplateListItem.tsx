import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

import type { ArchitectureCategory } from "@/types/architecture";
import { ListItemCard } from "@/components/shared/ListItemCard";

interface ArchitectureTemplate {
  title: string;
  description: string;
  category: ArchitectureCategory;
  practices: string;
  scenarios: string;
}

interface ArchitectureTemplateListItemProps {
  item: ArchitectureTemplate;
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  onAddItem: (item: ArchitectureTemplate) => Promise<void>;
}

export const ArchitectureTemplateListItem: React.FC<ArchitectureTemplateListItemProps> = ({
  item,
  CATEGORY_LABELS,
  onAddItem,
}) => {
  return (
    <ListItemCard
      id={item.title}
      title={item.title}
      subtitle={item.description}
      badge={CATEGORY_LABELS[item.category]}
      footerButtons={
        <Button size="sm" variant="outline" onClick={() => onAddItem(item)}>
          <Copy className="h-4 w-4 mr-1" />
          Add to my ideas
        </Button>
      }
    />
  );
};
