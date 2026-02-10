"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty } from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderOpen, Plus } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";

export function LocalProjectsCard() {
  const [localPaths, setLocalPaths] = useState<string[]>([]);

  useEffect(() => {
    const loadLocalPaths = () => {
      if (isTauri()) {
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          Local projects
        </CardTitle>
        <CardDescription>
          All folders in your <code className="text-xs bg-muted px-1 rounded">Documents/February</code> folder. Use a path to create a first-class project above or for runs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {localPaths.length === 0 ? (
          <Empty
            icon={<FolderOpen className="h-6 w-6" />}
            title="No February folders"
            description="No subfolders found in your Documents/February folder, or the app is not running from a project inside it."
          />
        ) : (
          <ScrollArea className="h-[240px] rounded-md border p-3">
            <ul className="space-y-2 text-sm">
              {localPaths.map((path, i) => (
                <li
                  key={i}
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
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
