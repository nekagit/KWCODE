"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TEST_BEST_PRACTICES_LIST } from "@/data/test-best-practices";

export function CuratedPracticesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Curated best practices</CardTitle>
        <CardDescription>
          Reference list for writing and reviewing tests. See also{" "}
          <code className="rounded bg-muted px-1">.cursor/test-best-practices.md</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <ul className="space-y-2">
            {TEST_BEST_PRACTICES_LIST.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
