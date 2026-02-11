"use client";

import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { LocalProjectListItem } from "@/components/atoms/list-items/LocalProjectListItem";

/**
 * Lists all folders in the configured projects root so the user can create a project from a path
 * without having to find or type it. Uses Tauri list_february_folders or /api/data/february-folders.
 */
export function LocalReposSection() {
  const [localPaths, setLocalPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const done = () => setLoading(false);
    const apply = (paths: string[]) => setLocalPaths(Array.isArray(paths) ? paths : []);

    const fetchFromApi = () =>
      fetch("/api/data/february-folders")
        .then((r) => (r.ok ? r.json() : { folders: [] }))
        .then((data) => Array.isArray(data.folders) ? data.folders : [] as string[])
        .catch(() => [] as string[]);

    if (isTauri) {
      fetchFromApi().then((folders) => {
        if (folders.length > 0) {
          apply(folders);
          done();
          return;
        }
        invoke<string[]>("list_february_folders")
          .then((paths) => apply(paths ?? []))
          .catch(() => apply([]))
          .finally(done);
      });
    } else {
      fetchFromApi().then(apply).finally(done);
    }
  }, []);

  if (loading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TitleWithIcon icon={FolderOpen} title="Local repos" className="text-lg" />
        </h2>
        <p className="text-sm text-muted-foreground">
          Folders in the configured projects directory. Create a project from one to avoid typing the path.
        </p>
        <div className="py-8 text-center text-muted-foreground text-sm">Loading…</div>
      </section>
    );
  }

  if (localPaths.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TitleWithIcon icon={FolderOpen} title="Local repos" className="text-lg" />
        </h2>
        <p className="text-sm text-muted-foreground">
          Folders in the configured projects directory.
        </p>
        <EmptyState
          icon={FolderOpen}
          message="No project folders found"
          description="No subfolders in the configured projects directory, or the app cannot read that path. Set data/february-dir.txt or FEBRUARY_DIR, or run from the Tauri desktop app."
        />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <TitleWithIcon icon={FolderOpen} title="Local repos" className="text-lg" />
      </h2>
      <p className="text-sm text-muted-foreground">
        All {localPaths.length} folders in the configured projects directory. Create a project from one to avoid typing the path.
      </p>
      <ScrollArea className="rounded-md border bg-muted/30 max-h-[520px]">
        <ul className="p-2 space-y-0.5">
          {localPaths.map((path, i) => (
            <LocalProjectListItem key={i} path={path} />
          ))}
        </ul>
      </ScrollArea>
    </section>
  );
}
