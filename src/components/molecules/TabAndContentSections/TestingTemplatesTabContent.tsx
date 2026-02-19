/** Testing Templates Tab Content component. */
import { TestGenerationCard } from "@/components/molecules/CardsAndDisplay/TestGenerationCard.tsx";
import { TestTemplateList } from "@/components/molecules/ListsAndTables/TestTemplateList.tsx";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/TestingTemplatesTabContent.tsx");

interface TestingTemplatesTabContentProps {
  aiPromptRecord: string;
  setAiPromptRecord: React.Dispatch<React.SetStateAction<string>>;
  aiLoading: boolean;
  aiResult: string | null;
  handleAiGenerate: () => Promise<void>;
  copiedId: string | null;
  setCopiedId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function TestingTemplatesTabContent({
  aiPromptRecord,
  setAiPromptRecord,
  aiLoading,
  aiResult,
  handleAiGenerate,
  copiedId,
  setCopiedId,
}: TestingTemplatesTabContentProps) {
  return (
    <div className={classes[0]}>
      <TestGenerationCard
        aiPromptRecord={aiPromptRecord}
        setAiPromptRecord={setAiPromptRecord}
        aiLoading={aiLoading}
        aiResult={aiResult}
        handleAiGenerate={handleAiGenerate}
      />
      <TestTemplateList copiedId={copiedId} setCopiedId={setCopiedId} />
    </div>
  );
}
