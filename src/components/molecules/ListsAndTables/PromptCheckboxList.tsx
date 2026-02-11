import React from 'react';
import type { PromptRecord } from "@/types/prompt";
import { PromptRecordCheckboxItem } from "@/components/atoms/PromptRecordCheckboxItem";

interface PromptRecordCheckboxListProps {
  prompts: PromptRecord[];
  selectedPromptRecordIds: number[];
  setSelectedPromptRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptRecordCheckboxList({
  prompts,
  selectedPromptRecordIds,
  setSelectedPromptRecordIds,
}: PromptRecordCheckboxListProps) {
  const handleToggle = (id: number, checked: boolean) => {
    setSelectedPromptRecordIds((prev) =>
      checked ? [...prev, id] : prev.filter((promptId) => promptId !== id)
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <PromptRecordCheckboxItem
          key={p.id}
          promptId={p.id}
          promptTitle={p.title}
          isChecked={selectedPromptRecordIds.includes(p.id)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
