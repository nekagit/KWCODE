import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import type { ArchitectureCategory } from "@/types/architecture";

interface TemplateArchitecture {
  name: string;
  description: string;
  category: ArchitectureCategory;
  practices: string;
  scenarios: string;
}

interface ArchitectureTemplateListItemProps {
  template: TemplateArchitecture;
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  onAddFromTemplate: (t: TemplateArchitecture) => Promise<void>;
}

export const ArchitectureTemplateListItem: React.FC<ArchitectureTemplateListItemProps> = ({
  template,
  CATEGORY_LABELS,
  onAddFromTemplate,
}) => {
  return (
    <li>
      <Card className="bg-muted/30">
        <div className="pt-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{template.description || "—"}</p>
              <Badge variant="secondary" className="mt-2">
                {CATEGORY_LABELS[template.category]}
              </Badge>
            </div>
            <ButtonGroup alignment="right">
              <Button size="sm" variant="outline" className="shrink-0" onClick={() => onAddFromTemplate(template)}>
                <Copy className="h-4 w-4 mr-1" />
                Add to my definitions
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Card>
    </li>
  );
};
