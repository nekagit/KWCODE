import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // Keeping shadcn card for now inside the list item as it has specific styling
import { Pencil, Trash2, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/shared/ButtonGroup";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface IdeaRecord {
  id: number;
  title: string;
  description: string;
  category: keyof IdeaCategoryLabels;
  source: "template" | "ai" | "manual";
  created_at?: string;
  updated_at?: string;
}

interface IdeaListItemProps {
  idea: IdeaRecord;
  CATEGORY_LABELS: IdeaCategoryLabels;
  generatingProjectIdeaId: number | null;
  onGenerateProject: (ideaId: number) => Promise<void>;
  onOpenEdit: (idea: IdeaRecord) => void;
  onDelete: (ideaId: number) => Promise<void>;
}

export const IdeaListItem: React.FC<IdeaListItemProps> = ({
  idea,
  CATEGORY_LABELS,
  generatingProjectIdeaId,
  onGenerateProject,
  onOpenEdit,
  onDelete,
}) => {
  return (
    <li key={idea.id}>
      <Card className={cn("bg-muted/30")}>
        <div className="pt-4 p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">{idea.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{idea.description || "—"}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{CATEGORY_LABELS[idea.category]}</Badge>
                <Badge variant="outline" className="text-xs">
                  {idea.source}
                </Badge>
              </div>
            </div>
            <ButtonGroup alignment="right">
              <Button
                size="sm"
                variant="default"
                title="Generate a full project from this idea (prompts, tickets, features, design, architecture)"
                disabled={generatingProjectIdeaId !== null}
                onClick={() => onGenerateProject(idea.id)}
              >
                {generatingProjectIdeaId === idea.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                <span className="ml-1.5 sr-only sm:not-sr-only">Generate project</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0"
                onClick={() => onOpenEdit(idea)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="shrink-0 text-destructive hover:text-destructive"
                title="Delete idea"
                onClick={() => onDelete(idea.id)}
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
