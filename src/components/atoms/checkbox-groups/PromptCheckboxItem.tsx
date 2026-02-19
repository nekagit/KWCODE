/** Prompt Checkbox Item component. */
import React from 'react';
import { CheckboxComponent } from "@/components/shared/CheckboxComponent";

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
    <div className="rounded-md border px-3 py-2 hover:bg-muted/50">
      <CheckboxComponent
        id={promptId.toString()}
        label={`${promptId}: ${promptTitle}`}
        checked={isChecked}
        onCheckedChange={(checked: boolean) => onToggle(promptId, checked)}
      />
    </div>
  );
};
