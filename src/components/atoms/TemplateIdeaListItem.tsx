import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // Keeping shadcn card for now inside the list item as it has specific styling
import { Copy } from "lucide-react";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface TemplateIdea {
  title: string;
  description: string;
  category: keyof IdeaCategoryLabels;
}

interface TemplateIdeaListItemProps {
  idea: TemplateIdea;
  CATEGORY_LABELS: IdeaCategoryLabels;
  onAddToMyIdeas: (item: TemplateIdea, source: "template" | "ai") => Promise<void>;
}

export const TemplateIdeaListItem: React.FC<TemplateIdeaListItemProps> = ({
  idea,
  CATEGORY_LABELS,
  onAddToMyIdeas,
}) => {
  return (
    <li>
      <Card className="bg-muted/30">
        <div className="pt-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{idea.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
              <Badge variant="secondary" className="mt-2">
                {CATEGORY_LABELS[idea.category]}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => onAddToMyIdeas(idea, "template")}
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
