"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderOpen } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { LocalProjectListItem } from "@/components/atoms/list-items/LocalProjectListItem";

export function LocalProjectsCard() {
  const [localPaths, setLocalPaths] = useState<string[]>([]);

  useEffect(() => {
    const loadLocalPaths = () => {
      if (isTauri) {
        invoke<string[]>("list_february_folders")
          .then((paths) => setLocalPaths(Array.isArray(paths) ? paths : []))
          .catch(() => setLocalPaths([]));
      } else {
        fetch("/api/data/february-folders")
          .then((r) => (r.ok ? r.json() : { folders: [] }))
          .then((data) => setLocalPaths(Array.isArray(data.folders) ? data.folders : []))
          .catch(() => setLocalPaths([]));
      }
    };
    loadLocalPaths();
  }, []);

  return (
    <Card
      title={<TitleWithIcon icon={FolderOpen} title="Local projects" className="text-lg" />}
      subtitle={
        <>
          All folders in your <code className="text-xs bg-muted px-1 rounded">Documents/February</code> folder. Use a path to create a first-class project above or for runs.
        </>
      }
    >
      {localPaths.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          message="No February folders"
          action="No subfolders found in your Documents/February folder, or the app is not running from a project inside it."
        />
      ) : (
        <ScrollArea className="h-[240px] rounded-md border p-3">
          <ul className="space-y-2 text-sm">
            {localPaths.map((path, i) => (
              <LocalProjectListItem key={i} path={path} />
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}
