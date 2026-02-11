import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { ListItemCard } from "@/components/shared/ListItemCard";
import {
  TEST_TEMPLATE_CATEGORIES,
  type TestTemplate,
} from "@/data/test-templates";

interface TestTemplateListItemProps {
  template: TestTemplate;
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
}

export const TestTemplateListItem: React.FC<TestTemplateListItemProps> = ({
  template: t,
  copiedId,
  setCopiedId,
}) => {
  const copyTemplate = useCallback(() => {
    const text = t.prompt;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [t.id, t.prompt, setCopiedId]);

  const children = (
    <div className="flex flex-col gap-2">
      <Badge variant="secondary" className="mt-2">
        {TEST_TEMPLATE_CATEGORIES[t.category]}
      </Badge>
      <p className="text-xs text-muted-foreground mt-2 font-mono bg-background/50 rounded p-2 border">
        {t.prompt}
      </p>
    </div>
  );

  return (
    <ListItemCard
      id={t.id}
      title={t.name}
      subtitle={t.description}
      children={children}
      footerButtons={
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={copyTemplate}
        >
          {copiedId === t.id ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="ml-1.5">Copy</span>
        </Button>
      }
    />
  );
};
