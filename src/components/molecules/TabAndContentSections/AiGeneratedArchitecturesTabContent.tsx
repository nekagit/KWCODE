import { ArchitectureCategory } from "@/types/architecture";
import { AiGeneratedArchitecturesCard } from "@/components/molecules/AiGeneratedArchitecturesCard/AiGeneratedArchitecturesCard";

interface AiGeneratedArchitecturesTabContentProps {
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  addFromAi: (item: any) => Promise<void>;
}

export function AiGeneratedArchitecturesTabContent({
  CATEGORY_LABELS,
  addFromAi,
}: AiGeneratedArchitecturesTabContentProps) {
  return (
    <div className="mt-6">
      <AiGeneratedArchitecturesCard CATEGORY_LABELS={CATEGORY_LABELS} addFromAi={addFromAi} />
    </div>
  );
}
