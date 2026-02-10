"use client";

import { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check } from "lucide-react";
import {
  TEST_TEMPLATES,
  TEST_TEMPLATE_CATEGORIES,
  type TestTemplate,
} from "@/data/test-templates";

interface TestTemplateListProps {
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
}

export function TestTemplateList({ copiedId, setCopiedId }: TestTemplateListProps) {
  const copyTemplate = useCallback((t: TestTemplate) => {
    const text = t.prompt;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, [setCopiedId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test templates</CardTitle>
        <CardDescription>
          Copy a prompt to use with your AI assistant or Cursor to generate tests. Edit as needed for your stack.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
          <ul className="space-y-3">
            {TEST_TEMPLATES.map((t) => (
              <li key={t.id}>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{t.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                        <Badge variant="secondary" className="mt-2">
                          {TEST_TEMPLATE_CATEGORIES[t.category]}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-2 font-mono bg-background/50 rounded p-2 border">
                          {t.prompt}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => copyTemplate(t)}
                      >
                        {copiedId === t.id ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        <span className="ml-1.5">Copy</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
