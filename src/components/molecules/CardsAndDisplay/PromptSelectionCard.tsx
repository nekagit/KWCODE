"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { PromptCheckboxItem } from "@/components/atoms/checkbox-groups/PromptCheckboxItem";

interface PromptRecordSelectionCardProps {
  prompts: { id: number; title: string }[];
  selectedPromptRecordIds: number[];
  setSelectedPromptRecordIds: React.Dispatch<React.SetStateAction<number[]>>; // Updated to accept a functional updater
}

export function PromptRecordSelectionCard({
  prompts,
  selectedPromptRecordIds,
  setSelectedPromptRecordIds,
}: PromptRecordSelectionCardProps) {
  const handleToggle = (id: number, checked: boolean) => {
    setSelectedPromptRecordIds((prev: number[]) =>
      checked ? [...prev, id] : prev.filter((promptId: number) => promptId !== id)
    );
  };

  return (
    <Card
      title={<TitleWithIcon icon={MessageSquare} title="PromptRecords" className="text-lg" />}
      subtitle={
        <>
          Select at least one prompt to run (script <code className="text-xs">-p ID ...</code>).
        </>
      }
    >
      <ScrollArea className="h-[180px] rounded-md border p-3">
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <PromptCheckboxItem
              key={p.id}
              promptId={p.id}
              promptTitle={p.title}
              isChecked={selectedPromptRecordIds.includes(p.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
