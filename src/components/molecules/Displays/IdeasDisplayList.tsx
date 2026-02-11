import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("Displays/IdeasDisplayList.tsx");

interface IdeasDisplayListProps {
  ideas: { id: number; title: string; description: string; category: string }[];
  ideasLoading: boolean;
}

export const IdeasDisplayList: React.FC<IdeasDisplayListProps> = ({
  ideas,
  ideasLoading,
}) => {
  return (
    <>
      {ideasLoading ? (
        <Skeleton className={classes[0]} />
      ) : (
        <ScrollArea className={classes[1]}>
          <div className={classes[2]}>
            {ideas.map((i) => (
              <div key={i.id} className={classes[3]}>
                <p className={classes[4]}>{i.title}</p>
                <p className={classes[5]}>{i.description}</p>
                <Badge variant="secondary" className={classes[6]}>{i.category}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      <p className={classes[7]}>
        <Link href="/ideas" className={classes[8]}>Ideas page</Link> to create and edit.
      </p>
    </>
  );
};
