"use client";

import { useState, useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { invoke, isTauri } from "@/lib/tauri";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/shared/EmptyState";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { LocalProjectListItem } from "@/components/atoms/list-items/LocalProjectListItem";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

/**
 * Lists all folders in the configured projects root so the user can create a project from a path
 * without having to find or type it. Uses Tauri list_february_folders or /api/data/february-folders.
 * Shown inside a collapsible section that is collapsed by default.
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

  const triggerLabel =
    localPaths.length > 0
      ? `Local repos (${localPaths.length})`
      : "Local repos";

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <p className="text-sm text-muted-foreground">
            Folders in the configured projects directory. Create a project from one to avoid typing the path.
          </p>
          <div className="py-8 text-center text-muted-foreground text-sm">Loading…</div>
        </>
      );
    }
    if (localPaths.length === 0) {
      return (
        <>
          <p className="text-sm text-muted-foreground">
            Folders in the configured projects directory.
          </p>
          <EmptyState
            icon={FolderOpen}
            message="No project folders found"
            description="No subfolders in the configured projects directory, or the app cannot read that path. Set data/february-dir.txt or FEBRUARY_DIR, or run from the Tauri desktop app."
          />
        </>
      );
    }
    return (
      <>
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
      </>
    );
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="local-repos" className="border-b">
        <AccordionTrigger className="text-lg font-semibold py-4 hover:no-underline">
          <TitleWithIcon icon={FolderOpen} title={triggerLabel} className="text-lg" iconClassName="text-success/90" />
        </AccordionTrigger>
        <AccordionContent className="space-y-3">
          {renderContent()}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
