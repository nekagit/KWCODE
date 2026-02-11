import { PromptRecordsAndTiming } from "@/components/organisms/PromptsAndTiming.tsx";
import type { PromptRecord } from "@/types/prompt";

interface PromptsTabContentProps {
  prompts: PromptRecord[];
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptsTabContent({
  prompts,
  selectedPromptRecordIds,
  setSelectedPromptRecordIds,
}: PromptsTabContentProps) {
  return (
    <div className="mt-0 space-y-6">
      <PromptsAndTiming
        prompts={prompts}
        selectedPromptIds={selectedPromptRecordIds}
        setSelectedPromptRecordIds={setSelectedPromptRecordIds}
      />
    </div>
  );
}
