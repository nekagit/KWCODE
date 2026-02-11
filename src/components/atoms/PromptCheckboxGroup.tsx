import React from 'react';
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";

interface PromptCheckboxGroupProps {
  prompts: { id: number; title: string }[];
  selectedPromptIds: number[];
  onSelectionChange: (ids: number[]) => void;
}

export const PromptCheckboxGroup: React.FC<PromptCheckboxGroupProps> = ({
  prompts,
  selectedPromptIds,
  onSelectionChange,
}) => {
  const handleCheckedChange = (promptId: number, checked: boolean) => {
    const newSelection = checked
      ? [...selectedPromptIds, promptId]
      : selectedPromptIds.filter((id) => id !== promptId);
    onSelectionChange(newSelection);
  };

  return (
    <div className="grid gap-2">
      <Label>Prompts (required)</Label>
      <div className="flex flex-wrap gap-2">
        {prompts.map((p) => (
          <label
            key={p.id}
            className="flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1 text-sm hover:bg-muted/50"
          >
            <Checkbox
              checked={selectedPromptIds.includes(p.id)}
              onCheckedChange={(checked: boolean) => handleCheckedChange(p.id, checked)}
            />
            {p.id}: {p.title}
          </label>
        ))}
      </div>
    </div>
  );
};
