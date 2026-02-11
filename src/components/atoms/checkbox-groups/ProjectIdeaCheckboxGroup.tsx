import React from 'react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb } from "lucide-react";
import { CheckboxComponent } from "@/components/shared/CheckboxComponent";

type IdeaItem = { id: number; title: string; category?: string };

interface ProjectIdeaCheckboxGroupProps {
  ideas: IdeaItem[];
  selectedIdeaIds: number[];
  onToggleIdea: (id: number) => void;
}

export const ProjectIdeaCheckboxGroup: React.FC<ProjectIdeaCheckboxGroupProps> = ({
  ideas,
  selectedIdeaIds,
  onToggleIdea,
}) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4" />
        Ideas ({selectedIdeaIds.length} linked)
      </Label>
      <ScrollArea className="h-[180px] rounded border p-2">
        <div className="space-y-2">
          {ideas.map((i) => (
            <CheckboxComponent
              key={i.id}
              id={i.id.toString()}
              label={i.title}
              checked={selectedIdeaIds.includes(i.id)}
              onCheckedChange={() => onToggleIdea(i.id)}
            />
          ))}
          {ideas.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No ideas. Add some on the Ideas page.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
