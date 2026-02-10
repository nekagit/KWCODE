"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy } from "lucide-react";
import type { ArchitectureCategory, ArchitectureRecord } from "@/types/architecture";
import { ARCHITECTURE_TEMPLATES } from "@/data/architecture-templates";

interface ArchitectureTemplateCardProps {
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  addFromTemplate: (t: { name: string; category: ArchitectureCategory; description: string; practices: string; scenarios: string }) => Promise<void>;
}

export function ArchitectureTemplateCard({ CATEGORY_LABELS, addFromTemplate }: ArchitectureTemplateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Template architectures</CardTitle>
        <CardDescription>
          Pre-defined patterns and best practices. Add any to &quot;My definitions&quot; and edit or add more inputs there.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
          <ul className="space-y-3">
            {ARCHITECTURE_TEMPLATES.map((t, i) => (
              <li key={i}>
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium">{t.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description || "—"}</p>
                        <Badge variant="secondary" className="mt-2">
                          {CATEGORY_LABELS[t.category]}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline" className="shrink-0" onClick={() => addFromTemplate(t)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Add to my definitions
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
