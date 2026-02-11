import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

type PromptItem = { id: number; title: string };

interface ProjectPromptCheckboxGroupProps {
  prompts: PromptItem[];
  selectedPromptIds: number[];
  onTogglePrompt: (id: number) => void;
}

export const ProjectPromptCheckboxGroup: React.FC<ProjectPromptCheckboxGroupProps> = ({
  prompts,
  selectedPromptIds,
  onTogglePrompt,
}) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Prompts ({selectedPromptIds.length} linked)
      </Label>
      <ScrollArea className="h-[180px] rounded border p-2">
        <div className="space-y-2">
          {prompts.map((p) => (
            <label key={p.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
              <Checkbox
                checked={selectedPromptIds.includes(p.id)}
                onCheckedChange={() => onTogglePrompt(p.id)}
              />
              <span className="truncate">{p.title || `#${p.id}`}</span>
            </label>
          ))}
          {prompts.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No prompts. Add some on the Prompts page.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
