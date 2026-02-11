import { ArchitectureCategory } from "@/types/architecture";
import { AiGeneratedArchitecturesCard } from "@/components/molecules/CardsAndDisplay/AiGeneratedArchitecturesCard.tsx";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/AiGeneratedArchitecturesTabContent.tsx");

interface AiGeneratedArchitecturesTabContentProps {
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  addFromAi: (item: any) => Promise<void>;
}

export function AiGeneratedArchitecturesTabContent({
  CATEGORY_LABELS,
  addFromAi,
}: AiGeneratedArchitecturesTabContentProps) {
  return (
    <div className={classes[0]}>
      <AiGeneratedArchitecturesCard CATEGORY_LABELS={CATEGORY_LABELS} addFromAi={addFromAi} />
    </div>
  );
}
