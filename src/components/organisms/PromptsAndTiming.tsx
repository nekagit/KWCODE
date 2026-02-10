import type { PromptItem as Prompt } from "@/types/run";
import { PromptsAndTimingCard } from "@/components/molecules/PromptsAndTimingCard/PromptsAndTimingCard";
import { PromptCheckboxList } from "@/components/molecules/PromptCheckboxList/PromptCheckboxList";

interface PromptsAndTimingProps {
  prompts: Prompt[];
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptsAndTiming({ prompts, selectedPromptIds, setSelectedPromptIds }: PromptsAndTimingProps) {
  return (
    <PromptsAndTimingCard>
      <PromptCheckboxList
        prompts={prompts}
        selectedPromptIds={selectedPromptIds}
        setSelectedPromptIds={setSelectedPromptIds}
      />
    </PromptsAndTimingCard>
  );
}
