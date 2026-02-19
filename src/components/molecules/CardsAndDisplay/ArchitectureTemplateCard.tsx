"use client";

/** Architecture Template Card component. */
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { ArchitectureTemplateListItem } from "@/components/atoms/list-items/ArchitectureTemplateListItem";
import type { ArchitectureCategory } from "@/types/architecture";
import { ARCHITECTURE_TEMPLATES } from "@/data/architecture-templates";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/ArchitectureTemplateCard.tsx");

interface ArchitectureTemplateCardProps {
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  addFromTemplate: (t: { name: string; category: ArchitectureCategory; description: string; practices: string; scenarios: string }) => Promise<void>;
}

export function ArchitectureTemplateCard({ CATEGORY_LABELS, addFromTemplate }: ArchitectureTemplateCardProps) {
  return (
    <Card
      title="Template architectures"
      subtitle="Pre-defined patterns and best practices. Add any to &quot;My definitions&quot; and edit or add more inputs there."
    >
      <ScrollArea className={classes[0]}>
        <ul className={classes[1]}>
          {ARCHITECTURE_TEMPLATES.map((t, i) => (
            <ArchitectureTemplateListItem
              key={i}
              item={{
                title: t.name,
                description: t.description,
                category: t.category,
                practices: t.practices,
                scenarios: t.scenarios,
              }}
              CATEGORY_LABELS={CATEGORY_LABELS}
              onAddItem={async (item) => {
                await addFromTemplate({
                  name: item.title,
                  category: item.category,
                  description: item.description,
                  practices: item.practices,
                  scenarios: item.scenarios,
                });
              }}
            />
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
