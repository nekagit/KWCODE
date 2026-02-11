import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LocalProjectListItemProps {
  path: string;
}

export const LocalProjectListItem: React.FC<LocalProjectListItemProps> = ({ path }) => {
  return (
    <li
      className="flex items-center gap-2 rounded-md py-1.5 px-2 hover:bg-muted/50 group"
    >
      <span className="flex-1 min-w-0 truncate font-mono text-muted-foreground" title={path}>
        {path}
      </span>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        asChild
      >
        <Link href={`/projects/new?repoPath=${encodeURIComponent(path)}`}>
          <Plus className="h-3.5 w-3 mr-1" />
          Create project
        </Link>
      </Button>
    </li>
  );
};
