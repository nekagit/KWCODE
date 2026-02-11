import { TestGenerationCard } from "@/components/molecules/CardsAndDisplay/TestGenerationCard.tsx";
import { TestTemplateList } from "@/components/molecules/ListsAndTables/TestTemplateList.tsx";

interface TestingTemplatesTabContentProps {
  aiPrompt: string;
  setAiPrompt: React.Dispatch<React.SetStateAction<string>>;
  aiLoading: boolean;
  aiResult: string | null;
  handleAiGenerate: () => Promise<void>;
  copiedId: string | null;
  setCopiedId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function TestingTemplatesTabContent({
  aiPrompt,
  setAiPrompt,
  aiLoading,
  aiResult,
  handleAiGenerate,
  copiedId,
  setCopiedId,
}: TestingTemplatesTabContentProps) {
  return (
    <div className="mt-6 space-y-6">
      <TestGenerationCard
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        aiLoading={aiLoading}
        aiResult={aiResult}
        handleAiGenerate={handleAiGenerate}
      />
      <TestTemplateList copiedId={copiedId} setCopiedId={setCopiedId} />
    </div>
  );
}
