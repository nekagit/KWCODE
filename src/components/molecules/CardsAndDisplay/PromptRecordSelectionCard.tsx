"use client";

/** Prompt Record Selection Card component. */
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { PromptCheckboxItem } from "@/components/atoms/checkbox-groups/PromptCheckboxItem";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/PromptRecordSelectionCard.tsx");

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
      title={<TitleWithIcon icon={MessageSquare} title="PromptRecords" className={classes[0]} iconClassName="text-primary/90" />}
      subtitle={
        <>
          Select at least one prompt to run (script <code className={classes[1]}>-p ID ...</code>).
        </>
      }
    >
      <ScrollArea className={classes[2]}>
        <div className={classes[3]}>
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
