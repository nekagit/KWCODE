import React from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface PromptRecordCheckboxItemProps {
  promptId: number;
  promptTitle: string;
  isChecked: boolean;
  onToggle: (id: number, checked: boolean) => void;
}

export function PromptRecordCheckboxItem({
  promptId,
  promptTitle,
  isChecked,
  onToggle,
}: PromptRecordCheckboxItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={`prompt-${promptId}`}
        checked={isChecked}
        onCheckedChange={(checked) => onToggle(promptId, checked === true)}
      />
      <label htmlFor={`prompt-${promptId}`} className="text-sm cursor-pointer truncate">
        {promptTitle || `#${promptId}`}
      </label>
    </div>
  );
}
