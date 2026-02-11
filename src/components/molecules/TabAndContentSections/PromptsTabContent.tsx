import { PromptRecordSelectionCard } from "@/components/molecules/CardsAndDisplay/PromptRecordSelectionCard";
import type { PromptRecord } from "@/types/prompt";

interface PromptsTabContentProps {
  prompts: PromptRecord[];
  selectedPromptRecordIds: number[];
  setSelectedPromptRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptsTabContent({
  prompts,
  selectedPromptRecordIds,
  setSelectedPromptRecordIds,
}: PromptsTabContentProps) {
  return (
    <div className="mt-0 space-y-6">
      <PromptRecordSelectionCard
        prompts={prompts}
        selectedPromptRecordIds={selectedPromptRecordIds}
        setSelectedPromptRecordIds={setSelectedPromptRecordIds}
      />
    </div>
  );
}
