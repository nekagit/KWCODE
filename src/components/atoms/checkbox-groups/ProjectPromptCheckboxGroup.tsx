import React from 'react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { CheckboxComponent } from "@/components/shared/CheckboxComponent";

type Prompt = { id: number; title: string };

interface ProjectPromptCheckboxGroupProps {
  prompts: Prompt[];
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
        PromptRecords ({selectedPromptIds.length} linked)
      </Label>
      <ScrollArea className="h-[180px] rounded border p-2">
        <div className="space-y-2">
          {prompts.map((p) => (
            <CheckboxComponent
              key={p.id}
              id={p.id.toString()}
              label={p.title || `#${p.id}`}
              checked={selectedPromptIds.includes(p.id)}
              onCheckedChange={() => onTogglePrompt(p.id)}
            />
          ))}
          {prompts.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No prompts. Add some on the Prompts page.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
