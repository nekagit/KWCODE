import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { ListItemCard } from "@/components/shared/ListItemCard";
import type { IdeaCategory } from "@/types/idea";

interface IdeaTemplate {
  title: string;
  description: string;
  category: IdeaCategory;
  practices?: string;
  scenarios?: string;
}

interface IdeaTemplateListItemProps {
  item: IdeaTemplate;
  CATEGORY_LABELS: Record<IdeaCategory, string>;
  onAddItem: (item: IdeaTemplate) => Promise<void>;
}

export const IdeaTemplateListItem: React.FC<IdeaTemplateListItemProps> = ({
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
