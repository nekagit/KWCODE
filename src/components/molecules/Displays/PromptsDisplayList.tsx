/** Prompts Display List component. */
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PromptRecord } from "@/types/prompt";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/PromptsDisplayList.tsx");

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
    <ScrollArea className={classes[0]}>
      <div className={classes[1]}>
        {prompts.map((p) => (
          <div key={p.id} className={classes[2]}>
            <Checkbox
              checked={selectedPromptIds.includes(p.id)}
              onCheckedChange={(c) =>
                setSelectedPromptIds((prev: number[]) =>
                  prev.includes(p.id) ? prev.filter((id: number) => id !== p.id) : [...prev, p.id]
                )}
            />
            <span className={classes[3]}>{p.title || `#${p.id}`}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
