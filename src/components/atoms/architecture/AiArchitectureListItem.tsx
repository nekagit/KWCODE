import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // Keeping shadcn card for now inside the list item as it has specific styling
import { Copy } from "lucide-react";
import type { ArchitectureCategory } from "@/types/architecture";

type AiArchitectureResult = { name: string; description: string; category: ArchitectureCategory; practices: string; scenarios: string };

interface AiArchitectureListItemProps {
  item: AiArchitectureResult;
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  onAddFromAi: (item: AiArchitectureResult) => Promise<void>;
}

export const AiArchitectureListItem: React.FC<AiArchitectureListItemProps> = ({
  item,
  CATEGORY_LABELS,
  onAddFromAi,
}) => {
  return (
    <li>
      <Card className="bg-muted/30">
        <div className="pt-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              <Badge variant="secondary" className="mt-2">
                {CATEGORY_LABELS[item.category]}
              </Badge>
            </div>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => onAddFromAi(item)}>
              <Copy className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </Card>
    </li>
  );
};
