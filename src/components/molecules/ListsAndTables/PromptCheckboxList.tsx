import React from 'react';
import type { Prompt } from "@/types/project";
import { PromptCheckboxItem } from "@/components/atoms/PromptCheckboxItem";

interface PromptCheckboxListProps {
  prompts: Prompt[];
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptCheckboxList({
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
}: PromptCheckboxListProps) {
  const handleToggle = (id: number, checked: boolean) => {
    setSelectedPromptIds((prev) =>
      checked ? [...prev, id] : prev.filter((promptId) => promptId !== id)
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <PromptCheckboxItem
          key={p.id}
          promptId={p.id}
          promptTitle={p.title}
          isChecked={selectedPromptIds.includes(p.id)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
