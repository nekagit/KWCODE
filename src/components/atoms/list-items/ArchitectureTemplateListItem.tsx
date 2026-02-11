import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";

import type { ArchitectureCategory } from "@/types/architecture";

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
    <li>
      <Card className="bg-muted/30">
        <div className="pt-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              <Badge variant="secondary" className="mt-2">
                {CATEGORY_LABELS[item.category]}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => onAddItem(item)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Add to my ideas
            </Button>
          </div>
        </div>
      </Card>
    </li>
  );
};
