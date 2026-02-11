"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/TitleWithIcon";
import { ArchitectureTemplateListItem } from "@/components/atoms/ArchitectureTemplateListItem";
import type { ArchitectureCategory } from "@/types/architecture";
import { ARCHITECTURE_TEMPLATES } from "@/data/architecture-templates";

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
      <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
        <ul className="space-y-3">
          {ARCHITECTURE_TEMPLATES.map((t, i) => (
            <ArchitectureTemplateListItem
              key={i}
              template={t}
              CATEGORY_LABELS={CATEGORY_LABELS}
              onAddFromTemplate={addFromTemplate}
            />
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
