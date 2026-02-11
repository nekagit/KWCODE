"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/shared/Card";
import { CuratedPracticeListItem } from "@/components/atoms/list-items/CuratedPracticeListItem";
import { TEST_BEST_PRACTICES_LIST } from "@/data/test-best-practices";

export function CuratedPracticesCard() {
  return (
    <Card
      title="Curated best practices"
      subtitle={
        <>
          Reference list for writing and reviewing tests. See also{" "}
          <code className="rounded bg-muted px-1">.cursor/test-best-practices.md</code>.
        </>
      }
    >
      <ScrollArea className="h-[280px] pr-4">
        <ul className="space-y-2">
          {TEST_BEST_PRACTICES_LIST.map((item, i) => (
            <CuratedPracticeListItem key={i} practice={item} />
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
