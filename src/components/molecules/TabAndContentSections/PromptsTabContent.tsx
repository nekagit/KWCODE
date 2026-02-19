/** Prompts Tab Content component. */
import { PromptRecordSelectionCard } from "@/components/molecules/CardsAndDisplay/PromptRecordSelectionCard";
import type { PromptRecord } from "@/types/prompt";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/PromptsTabContent.tsx");

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
    <div className={classes[0]}>
      <PromptRecordSelectionCard
        prompts={prompts}
        selectedPromptRecordIds={selectedPromptRecordIds}
        setSelectedPromptRecordIds={setSelectedPromptRecordIds}
      />
    </div>
  );
}
