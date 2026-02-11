import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
        <Skeleton className="h-[200px] w-full rounded" />
      ) : (
        <ScrollArea className="h-[200px] rounded border p-2">
          <div className="space-y-2 text-sm">
            {ideas.map((i) => (
              <div key={i.id} className="rounded border p-2 bg-muted/20">
                <p className="font-medium truncate">{i.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{i.description}</p>
                <Badge variant="secondary" className="mt-1 text-xs">{i.category}</Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        <Link href="/ideas" className="text-primary hover:underline">Ideas page</Link> to create and edit.
      </p>
    </>
  );
};
