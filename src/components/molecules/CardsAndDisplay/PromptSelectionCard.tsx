"use client";

import { ScrollArea } from "@/components/shadcn/scroll-area";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/TitleWithIcon";
import { PromptCheckboxItem } from "@/components/atoms/PromptCheckboxItem";

interface PromptSelectionCardProps {
  prompts: { id: number; title: string }[];
  selectedPromptIds: number[];
  setSelectedPromptIds: (ids: number[]) => void;
}

export function PromptSelectionCard({
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
}: PromptSelectionCardProps) {
  const handleToggle = (id: number, checked: boolean) => {
    setSelectedPromptIds((prev) =>
      checked ? [...prev, id] : prev.filter((promptId) => promptId !== id)
    );
  };

  return (
    <Card
      title={<TitleWithIcon icon={MessageSquare} title="Prompts" className="text-lg" />}
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
              isChecked={selectedPromptIds.includes(p.id)}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
