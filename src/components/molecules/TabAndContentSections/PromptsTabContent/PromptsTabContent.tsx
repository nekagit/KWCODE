import { PromptsAndTiming } from "@/components/organisms/PromptsAndTiming";
import type { Prompt } from "@/types/project";

interface PromptsTabContentProps {
  prompts: Prompt[];
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptsTabContent({
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
}: PromptsTabContentProps) {
  return (
    <div className="mt-0 space-y-6">
      <PromptsAndTiming
        prompts={prompts}
        selectedPromptIds={selectedPromptIds}
        setSelectedPromptIds={setSelectedPromptIds}
      />
    </div>
  );
}
