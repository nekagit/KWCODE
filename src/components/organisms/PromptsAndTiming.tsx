import type { PromptRecordItem as PromptRecord } from "@/types/run";
import { PromptRecordSelectionCard } from "@/components/molecules/CardsAndDisplay/PromptSelectionCard"; // Corrected import

interface PromptRecordsAndTimingProps {
  prompts: PromptRecord[];
  selectedPromptRecordIds: number[];
  setSelectedPromptRecordIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptRecordsAndTiming({ prompts, selectedPromptRecordIds, setSelectedPromptRecordIds }: PromptRecordsAndTimingProps) {
  return (
    <PromptRecordSelectionCard // Corrected component name
      prompts={prompts}
      selectedPromptRecordIds={selectedPromptRecordIds}
      setSelectedPromptRecordIds={setSelectedPromptRecordIds}
    />
  );
}
