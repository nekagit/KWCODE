import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PromptRecord } from "@/types/prompt";

interface PromptsDisplayListProps {
  prompts: PromptRecord[];
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export const PromptsDisplayList: React.FC<PromptsDisplayListProps> = ({
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
}) => {
  return (
    <ScrollArea className="h-[200px] rounded border p-2">
      <div className="space-y-1 text-sm">
        {prompts.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <Checkbox
              checked={selectedPromptIds.includes(p.id)}
              onCheckedChange={(c) =>
                setSelectedPromptIds((prev: number[]) =>
                  prev.includes(p.id) ? prev.filter((id: number) => id !== p.id) : [...prev, p.id]
                )}
            />
            <span className="truncate">{p.title || `#${p.id}`}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
