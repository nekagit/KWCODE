import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Minus, Play, Loader2, Plus, Trash2, Pencil, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface IdeaActionsProps {
  idea: IdeaRecord;
  CATEGORY_LABELS: IdeaCategoryLabels;
  generatingProjectIdeaId: number | null;
  onGenerateProject: (ideaId: number) => Promise<void>;
  onOpenEdit: (idea: IdeaRecord) => void;
  onDelete: (ideaId: number) => Promise<void>;
}

export const IdeaActions: React.FC<IdeaActionsProps> = ({
  idea,
  CATEGORY_LABELS,
  generatingProjectIdeaId,
  onGenerateProject,
  onOpenEdit,
  onDelete,
}) => {
  return (
    <ButtonGroup alignment="right">
      <Button
        size="sm"
        variant="default"
        title="Generate a full project from this idea (prompts, tickets, design, architecture)"
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
  );
};
