"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/shared/Card";
import { TemplateIdeaListItem } from "@/components/atoms/TemplateIdeaListItem";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface TemplateIdea {
  title: string;
  description: string;
  category: keyof IdeaCategoryLabels;
}

interface IdeaTemplateCardProps {
  TEMPLATE_IDEAS: TemplateIdea[];
  CATEGORY_LABELS: IdeaCategoryLabels;
  addToMyIdeas: (item: TemplateIdea, source: "template" | "ai") => Promise<void>;
}

export function IdeaTemplateCard({
  TEMPLATE_IDEAS,
  CATEGORY_LABELS,
  addToMyIdeas,
}: IdeaTemplateCardProps) {
  return (
    <Card
      title="Template ideas"
      subtitle="Pre-written ideas you can add to &quot;My ideas&quot; and edit."
    >
      <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
        <ul className="space-y-3">
          {TEMPLATE_IDEAS.map((idea, i) => (
            <TemplateIdeaListItem
              key={i}
              idea={idea}
              CATEGORY_LABELS={CATEGORY_LABELS}
              onAddToMyIdeas={addToMyIdeas}
            />
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
