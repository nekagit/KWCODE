"use client";

import { useCallback } from "react";
import { Card } from "@/components/shared/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TEST_TEMPLATES } from "@/data/test-templates";
import { TestTemplateListItem } from "@/components/atoms/list-items/TestTemplateListItem";

interface TestTemplateListProps {
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
}

export function TestTemplateList({ copiedId, setCopiedId }: TestTemplateListProps) {
  return (
    <Card
      title="Test templates"
      subtitle="Copy a prompt to use with your AI assistant or Cursor to generate tests. Edit as needed for your stack."
    >
      <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
        <ul className="space-y-3">
          {TEST_TEMPLATES.map((t) => (
            <TestTemplateListItem
              key={t.id}
              template={t}
              copiedId={copiedId}
              setCopiedId={setCopiedId}
            />
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
