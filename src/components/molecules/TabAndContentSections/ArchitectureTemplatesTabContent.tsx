/** Architecture Templates Tab Content component. */
import { ArchitectureCategory } from "@/types/architecture";
import { ArchitectureTemplateCard } from "@/components/molecules/CardsAndDisplay/ArchitectureTemplateCard.tsx";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("TabAndContentSections/ArchitectureTemplatesTabContent.tsx");

interface ArchitectureTemplatesTabContentProps {
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  addFromTemplate: (t: { name: string; category: ArchitectureCategory; description: string; practices: string; scenarios: string }) => Promise<void>;
}

export function ArchitectureTemplatesTabContent({
  CATEGORY_LABELS,
  addFromTemplate,
}: ArchitectureTemplatesTabContentProps) {
  return (
    <div className={classes[0]}>
      <ArchitectureTemplateCard CATEGORY_LABELS={CATEGORY_LABELS} addFromTemplate={addFromTemplate} />
    </div>
  );
}
