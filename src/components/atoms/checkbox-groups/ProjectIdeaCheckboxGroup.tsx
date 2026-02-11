import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb } from "lucide-react";

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
            <label key={i.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
              <Checkbox
                checked={selectedIdeaIds.includes(i.id)}
                onCheckedChange={() => onToggleIdea(i.id)}
              />
              <span className="truncate">{i.title}</span>
            </label>
          ))}
          {ideas.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No ideas. Add some on the Ideas page.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
