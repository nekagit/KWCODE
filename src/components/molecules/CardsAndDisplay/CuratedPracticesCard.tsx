"use client";

/** Curated Practices Card component. */
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/shared/Card";
import { CuratedPracticeListItem } from "@/components/atoms/list-items/CuratedPracticeListItem";
import { TEST_BEST_PRACTICES_LIST } from "@/data/test-best-practices";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/CuratedPracticesCard.tsx");

export function CuratedPracticesCard() {
  return (
    <Card
      title="Curated best practices"
      subtitle={
        <>
          Reference list for writing and reviewing tests. See also{" "}
          <code className={classes[0]}>.cursor/test-best-practices.md</code>.
        </>
      }
    >
      <ScrollArea className={classes[1]}>
        <ul className={classes[2]}>
          {TEST_BEST_PRACTICES_LIST.map((item, i) => (
            <CuratedPracticeListItem key={i} practice={item} />
          ))}
        </ul>
      </ScrollArea>
    </Card>
  );
}
