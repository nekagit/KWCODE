import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

interface PromptCheckboxItemProps {
  promptId: number;
  promptTitle: string;
  isChecked: boolean;
  onToggle: (id: number, checked: boolean) => void;
}

export const PromptCheckboxItem: React.FC<PromptCheckboxItemProps> = ({
  promptId,
  promptTitle,
  isChecked,
  onToggle,
}) => {
  return (
    <label
      key={promptId}
      className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={(checked: boolean) => onToggle(promptId, checked)}
      />
      <span className="text-sm">
        {promptId}: {promptTitle}
      </span>
    </label>
  );
};
