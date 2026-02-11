"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/shared/Card";
import { IdeaTemplateListItem } from "@/components/atoms/list-items/IdeaTemplateListItem"; // Updated import
import { IdeaCategory } from "@/components/organisms/IdeasPageContent";

interface IdeaTemplateCardProps {
  TEMPLATE_IDEAS: { title: string; description: string; category: IdeaCategory; practices?: string; scenarios?: string }[];
  CATEGORY_LABELS: Record<IdeaCategory, string>;
  addToMyIdeas: (item: { title: string; description: string; category: IdeaCategory }, source: "template" | "ai") => Promise<void>;
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
            <IdeaTemplateListItem
              key={i}
              item={{
                title: idea.title,
                description: idea.description,
                category: idea.category,
                practices: idea.practices || "",
                scenarios: idea.scenarios || "",
              }}
              CATEGORY_LABELS={CATEGORY_LABELS}
              onAddItem={async (item) => {
                await addToMyIdeas({
                  title: item.title,
                  description: item.description,
                  category: item.category,
                }, "template");
              }}
            />
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
