import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card"; // Keeping shadcn card for now inside the list item as it has specific styling
import { Pencil, Trash2, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { ListItemCard } from "@/components/shared/ListItemCard";
import { IdeaActions } from "./IdeaActions";

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
  const children = (
    <div className="flex items-center gap-2 mt-2">
      <Badge variant="secondary">{CATEGORY_LABELS[idea.category]}</Badge>
      <Badge variant="outline" className="text-xs">
        {idea.source}
      </Badge>
    </div>
  );

  return (
    <ListItemCard
      id={idea.id.toString()}
      title={idea.title}
      subtitle={idea.description || "—"}
      children={children}
      footerButtons={
        <IdeaActions
          idea={idea}
          CATEGORY_LABELS={CATEGORY_LABELS}
          generatingProjectIdeaId={generatingProjectIdeaId}
          onGenerateProject={onGenerateProject}
          onOpenEdit={onOpenEdit}
          onDelete={onDelete}
        />
      }
    />
  );
};
