import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

import type { IdeaRecord, IdeaCategory } from "@/types/idea";
import { ListItemCard } from "@/components/shared/ListItemCard";

interface AiIdeaListItemProps {
  item: IdeaRecord;
  CATEGORY_LABELS: Record<IdeaCategory, string>;
  onAddFromAi: (item: IdeaRecord) => Promise<void>;
}

export const AiIdeaListItem: React.FC<AiIdeaListItemProps> = ({
  item,
  CATEGORY_LABELS,
  onAddFromAi,
}) => {
  return (
    <ListItemCard
      id={item.id.toString()}
      title={item.title}
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
